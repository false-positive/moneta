import json
from typing import Dict, List, Any, Tuple

import torch

from services.flask.agent import Agent

agent_title = "Ivan"
#agent_description =

class ScenarioAgent:
    def __init__(self, root_agent: Agent, agent_title: str, agent_description: str, scenario_setting: str, scenario_config: Dict[str, Any] = None, metrics_description: Dict[str, str] = None, targets_description: Dict[str, str] = None):
        """
        Initialize the scenario agent with configuration.

        Args:
            scenario_config: Dictionary containing scenario description, metrics or targets.
                            If None, use the default configuration.
        """

        self.agent = root_agent

        # Store scenario information
        self.agent_title = agent_title
        self.agent_description = agent_description
        self.scenario_setting = scenario_setting
        self.scenario_description = scenario_config["description"]
        self.metrics = scenario_config["metrics"]
        self.targets = scenario_config["targets"]
        #self.modifiers = scenario_config["modifiers"]
        self.metrics_description = metrics_description
        self.targets_description = targets_description

        # Track discovered information
        self.discovered_metrics = set()
        self.discovered_targets = set()
        #self.discovered_modifiers = set()

        # Conversation history
        self.conversation_history = []

        # Add system message with scenario description
        self.add_message("system", self._create_system_prompt())

    def set_root_agent(self, root_agent):
        self.agent = root_agent

    def _create_system_prompt(self) -> str:
        """Create the system prompt for the LLM with detailed instructions."""
        # Create a variables reference for the AI to use
        metrics_info = "\n".join([f"- {k}: {v}" for k, v in self.metrics.items()])
        targets_info = "\n".join([f"- {k}: {v}" for k, v in self.targets.items()])

        return f"""You are a {self.agent_title} agent. Here is the base scenario:

{self.scenario_description}

SCENARIO VARIABLES (PRIVATE REFERENCE - DO NOT REVEAL UNLESS ASKED):
METRICS:
{metrics_info}

TARGETS:
{targets_info}

INSTRUCTIONS:
1. You will respond to user questions based on this scenario. Do not mention your name in the response
2. When a user asks directly about a specific metric or target, provide the EXACT value from your reference.
3. Use the exact values from your reference when discussing any variable. Including variable name and value
4. Do not preemptively reveal variables users haven't asked about.
5. Answer explicitly with the variable name and value in json format: "variable": value if the question is specific enough.
6. STRICTLY ANSWER JUST WITH THE VARIABLE NAME AND VALUE IN THIS FORMAT: <VARIABLE>: VALUE, <VARIABLE>: VALUE
7. If the question is not specific enough just answer: "QUESTION NOT SPECIFIC ENOUGH"
"""

    def add_message(self, role: str, content: str) -> None:
        """Add a message to the conversation history."""
        self.conversation_history.append({"role": role, "content": content})

    def _discover_variables(self, agent_response: str) -> None:
        """
        Discover any hidden variables based on the agent's response.
        Args:
            agent_response: The agent's response to the user's question
        """
        def method1(agent_response: str):
            discovered_metrics = []

            for metric in self.metrics:
                if metric in agent_response:
                    discovered_metrics.append(metric)

            for target in self.targets:
                if target in agent_response:
                    discovered_metrics.append(target)

            return discovered_metrics

        #try:
        #    agent_response_json = json.loads('{' + agent_response + '}')
        #except Exception as e:
        #    return []
        #
        #
        #
        #for key in agent_response_json:
        #    if key in self.metrics and key not in self.discovered_metrics:
        #        self.discovered_metrics.add(key)
        #    if key in self.targets and key not in self.discovered_targets:
        #        self.discovered_targets.add(key)

        return method1(agent_response)


    def _explain_discovered_variable(self, agent_response: str) -> Dict[str, List[str]]:
        """
        Use the AI to check if the question is related to any undiscovered variables.
        Args:
            agent_response: The user's question
        Returns:
            Dictionary with lists of variable names that are related to the question
        """
        # Create the prompt to analyze the question
        analysis_prompt = f"""{self.agent_description}

DATA POINTS (FOR YOUR CONTEXT ONLY):
{agent_response}

Using this information, provide a clear, practical explanation of what this means for the {self.scenario_setting}. 

REFERENCE DATA (FOR YOUR CONTEXT ONLY):
METRICS GUIDE:
{self.metrics_description}

TARGETS GUIDE:
{self.targets_description}

ALREADY DISCUSSED METRICS/TARGETS/FACTORS:
- Metrics: {[k for k in self.metrics if k in self.discovered_metrics]}
- Targets: {[k for k in self.targets if k in self.discovered_targets]}

INSTRUCTIONS:
1. Speak directly as the {self.agent_title} - use professional but accessible language. Speak from first person perspective
2. Explain ONLY the metrics/values mentioned in the data point(s) above
3. Include the EXACT numerical values in your explanation
4. Keep your explanation concise and focused (1-2 sentences MAXIMUM)
5. No need to acknowledge that you're analyzing data - just deliver the insights
6. Use the reference descriptions for context, but put the information in your own words.
7. Explain the insights as if you know it very well.
"""

        try:
            # Create a standalone query to the model
            analysis_messages = [{"role": "user", "content": analysis_prompt}]
            inputs = self.agent.tokenizer.apply_chat_template(
                analysis_messages,
                add_generation_prompt=True,
                return_tensors="pt"
            )
            # Move inputs to the appropriate device
            if hasattr(self.agent.model, 'device'):
                inputs = inputs.to(self.agent.model.device)
            else:
                first_param = next(self.agent.model.parameters())
                inputs = inputs.to(first_param.device)
            with torch.no_grad():
                outputs = self.agent.model.generate(
                    inputs,
                    max_new_tokens=512,
                    temperature=0.1,  # Low temperature for more deterministic output
                )
            analysis_response = self.agent.tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
            return analysis_response
        except Exception as e:
            print(f"Error during relatedness analysis: {e}")
            return {}

    def process_question(self, user_question: str) -> Tuple[str, Dict[str, List[str]]]:
        """
        Process a user question, generate a response, and check if any
        hidden information has been discovered.

        Args:
            user_question: The user's question

        Returns:
            Tuple containing (agent_response, discovered_info)
        """
        # Add user question to history
        self.add_message("user", user_question)

        # Generate response from the model
        messages = self.conversation_history.copy()

        # Reduce history if it's getting too long to fit in context
        if len(messages) > 10:  # Arbitrary threshold, adjust as needed
            # Keep the system message and the last 9 messages
            messages = [messages[0]] + messages[-9:]

        try:
            inputs = self.agent.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            )

            # Move inputs to the appropriate device
            if hasattr(self.agent.model, 'device'):
                inputs = inputs.to(self.agent.model.device)
            else:
                # If model is distributed across devices, use the first parameter's device
                first_param = next(self.agent.model.parameters())
                inputs = inputs.to(first_param.device)

            with torch.no_grad():
                # Use more conservative generation settings
                outputs = self.agent.model.generate(
                    inputs,
                    max_new_tokens=256,  # Reduced from 512 to save memory
                    temperature=0.7,
                    top_p=0.9,
                    do_sample=True,
                )

            response = self.agent.tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
            if "{" in response:
                try:
                    agent_isolated_json = response.split('{', 2)[1].split('}', 2)[0]
                    response = agent_isolated_json
                except Exception as e:
                    pass

        except Exception as e:
            print(f"Error during generation: {e}")
            response = "I apologize, but I'm having difficulty processing that request. Could you rephrase your question?"

        secondary_response = self._explain_discovered_variable(response)

        # Add assistant response to history
        self.add_message("assistant", secondary_response)

        discoveries = self._discover_variables(response)

        return secondary_response, discoveries

    def get_discovery_status(self) -> Dict[str, Dict[str, bool]]:
        """Get the current discovery status of all hidden variables."""
        status = {
            "metrics": {k: (k in self.discovered_metrics) for k in self.metrics},
            "targets": {k: (k in self.discovered_targets) for k in self.targets},
        }
        return status

    def all_discovered(self) -> bool:
        """Check if all hidden variables have been discovered."""
        all_metrics_discovered = all(metric in self.discovered_metrics for metric in self.metrics)
        all_targets_discovered = all(target in self.discovered_targets for target in self.targets)
        return all_metrics_discovered and all_targets_discovered

    def clear_cuda_cache(self):
        """Clear CUDA cache to free up memory."""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
