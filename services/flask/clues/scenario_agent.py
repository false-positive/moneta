import datetime
import json
from typing import Dict, List, Any, Tuple

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

# Print current date and time for debugging
print(f"Script started at: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

AGENT_TITLE = "factory foreman"

AGENT_DESCRIPTION = "As the Factory Manager, your job is to interpret and explain key factory metrics in plain language to the team."

SCENARIO_SETTING = "factory"

# Default scenario configuration embedded in the code
DEFAULT_SCENARIO = {
    "description": "A factory produces widgets with varying efficiency based on worker skill, machine condition, and raw material quality. The factory has been operating for 5 years and has recently experienced some changes in production patterns.",
    "metrics": {
        "production_rate": 120,
        "defect_rate": 8,
        "worker_productivity": 25
    },
    "targets": {
        "production_rate_target": 150
    },
    "modifiers": {
    }
}

METRICS_DESCRIPTION = {
    "production_rate": "The production rate is the number of widgets produced per hour.",
    "defect_rate": "The defect rate is the percentage of defective widgets produced.",
    "worker_productivity": "Worker productivity is the average number of widgets produced per worker per hour."
}

TARGETS_DESCRIPTION = {
    "production_rate_target": "The production rate target is the desired number of widgets to be produced per hour."
}

#TODO Add modifier description

class ScenarioAgent:
    def __init__(self, agent_title: str, agent_description: str, scenario_setting: str, scenario_config: Dict[str, Any] = None, metrics_description: Dict[str, str] = None, targets_description: Dict[str, str] = None):
        """
        Initialize the scenario agent with configuration.

        Args:
            scenario_config: Dictionary containing scenario description, metrics, targets, and modifiers.
                            If None, use the default configuration.
        """
        if agent_title is None:
            agent_title = AGENT_TITLE

        if agent_description is None:
            agent_description = AGENT_DESCRIPTION

        if scenario_setting is None:
            scenario_setting = SCENARIO_SETTING

        if metrics_description is None:
            metrics_description = METRICS_DESCRIPTION

        if targets_description is None:
            targets_description = TARGETS_DESCRIPTION

        # Use default scenario if none provided
        if scenario_config is None:
            scenario_config = DEFAULT_SCENARIO

        print("Loading model... This may take a few minutes.")
        # Load model with more aggressive memory optimization for 8GB VRAM
        self.model_id = "mistralai/Mistral-7B-Instruct-v0.3"

        # Configure quantization settings
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,  # Use 4-bit quantization instead of 8-bit
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,  # Use nested quantization
            bnb_4bit_quant_type="nf4",  # Use normalized float 4 for higher accuracy
        )

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)

        # Create a device map that will offload some layers to CPU if needed
        device_map = "auto"

        try:
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_id,
                device_map=device_map,
                quantization_config=quantization_config,
            )
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model with auto device map: {e}")
            print("Trying with more explicit memory management...")

            # Fallback to a more conservative approach
            try:
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_id,
                    load_in_4bit=True,
                    torch_dtype=torch.float16,
                    low_cpu_mem_usage=True,
                )
                print("Model loaded with fallback settings!")
            except Exception as e2:
                print(f"Error loading model with fallback settings: {e2}")
                raise RuntimeError("Could not load model with available resources")

        # Store scenario information
        self.agent_title = agent_title
        self.agent_description = agent_description
        self.scenario_setting = scenario_setting
        self.scenario_description = scenario_config["description"]
        self.metrics = scenario_config["metrics"]
        self.targets = scenario_config["targets"]
        self.modifiers = scenario_config["modifiers"]
        self.metrics_description = metrics_description
        self.targets_description = targets_description

        # Track discovered information
        self.discovered_metrics = set()
        self.discovered_targets = set()
        self.discovered_modifiers = set()

        # Conversation history
        self.conversation_history = []

        # Add system message with scenario description
        self.add_message("system", self._create_system_prompt())

    def _create_system_prompt(self) -> str:
        """Create the system prompt for the LLM with detailed instructions."""
        # Create a variables reference for the AI to use
        metrics_info = "\n".join([f"- {k}: {v}" for k, v in self.metrics.items()])
        targets_info = "\n".join([f"- {k}: {v}" for k, v in self.targets.items()])
        modifiers_info = "\n".join([f"- {k}: {v}" for k, v in self.modifiers.items()])

        return f"""You are a {self.agent_title} agent. Here is the base scenario:

{self.scenario_description}

SCENARIO VARIABLES (PRIVATE REFERENCE - DO NOT REVEAL UNLESS ASKED):
METRICS:
{metrics_info}

TARGETS:
{targets_info}

MODIFIERS:
{modifiers_info}

INSTRUCTIONS:
1. You will respond to user questions based on this scenario.
2. When a user asks directly about a specific metric, target, or modifier, provide the EXACT value from your reference.
3. Use the exact values from your reference when discussing any variable.
4. Do not preemptively reveal variables users haven't asked about.
5. Answer just with the variable name and value in json format: "variable": value if the question is specific enough.
6. If the question is not specific enough just answer: "QUESTION NOT SPECIFIC ENOUGH"

The user is CodenameSource1, and today's date is 2025-03-20.
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

        agent_response_json = json.loads('{' + agent_response + '}')

        for key in agent_response_json:
            if key in self.metrics and key not in self.discovered_metrics:
                self.discovered_metrics.add(key)
            if key in self.targets and key not in self.discovered_targets:
                self.discovered_targets.add(key)
            if key in self.modifiers and key not in self.discovered_modifiers:
                self.discovered_modifiers.add(key)

        return list(agent_response_json.keys())


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
- Factors: {[k for k in self.modifiers if k in self.discovered_modifiers]}

INSTRUCTIONS:
1. Speak directly as the {self.agent_title} - use professional but accessible language
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
            inputs = self.tokenizer.apply_chat_template(
                analysis_messages,
                add_generation_prompt=True,
                return_tensors="pt"
            )
            # Move inputs to the appropriate device
            if hasattr(self.model, 'device'):
                inputs = inputs.to(self.model.device)
            else:
                first_param = next(self.model.parameters())
                inputs = inputs.to(first_param.device)
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=512,
                    temperature=0.1,  # Low temperature for more deterministic output
                )
            analysis_response = self.tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
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
            inputs = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            )

            # Move inputs to the appropriate device
            if hasattr(self.model, 'device'):
                inputs = inputs.to(self.model.device)
            else:
                # If model is distributed across devices, use the first parameter's device
                first_param = next(self.model.parameters())
                inputs = inputs.to(first_param.device)

            with torch.no_grad():
                # Use more conservative generation settings
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=256,  # Reduced from 512 to save memory
                    temperature=0.7,
                    top_p=0.9,
                    do_sample=True,
                )

            response = self.tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)

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
            "modifiers": {k: (k in self.discovered_modifiers) for k in self.modifiers}
        }
        return status

    def all_discovered(self) -> bool:
        """Check if all hidden variables have been discovered."""
        all_metrics_discovered = all(metric in self.discovered_metrics for metric in self.metrics)
        all_targets_discovered = all(target in self.discovered_targets for target in self.targets)
        all_modifiers_discovered = all(modifier in self.discovered_modifiers for modifier in self.modifiers)
        return all_metrics_discovered and all_targets_discovered and all_modifiers_discovered

    def clear_cuda_cache(self):
        """Clear CUDA cache to free up memory."""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()


def create_custom_scenario(description: str, metrics: Dict[str, int], targets: Dict[str, int],
                           modifiers: Dict[str, str]) -> Dict:
    """Helper function to create a custom scenario configuration."""
    return {
        "description": description,
        "metrics": metrics,
        "targets": targets,
        "modifiers": modifiers
    }


def run_scenario_agent(scenario_config: Dict[str, Any] = None):
    """
    Run the scenario agent with the provided configuration or default.

    Args:
        scenario_config: Dictionary containing scenario configuration.
                         If None, use the default configuration.
    """
    try:
        agent = ScenarioAgent(scenario_config)

        print("=" * 80)
        print("Scenario Agent Initialized")
        print(f"Scenario: {agent.scenario_description}")
        print("=" * 80)
        print("Ask questions to discover metrics, targets, and hidden modifiers.")
        print("If your question is related to any variables, the agent will reveal them.")
        print("Type 'exit' to end the session.")
        print("Type 'status' to see what you've discovered so far.")
        print("=" * 80)

        while True:
            user_input = input("\nYour question: ")
            if user_input.lower() == 'exit':
                break
            elif user_input.lower() == 'status':
                # Display current discovery status
                status = agent.get_discovery_status()
                print("\nDiscovery Status:")
                for category, items in status.items():
                    discovered = [k for k, v in items.items() if v]
                    undiscovered = len(items) - len(discovered)
                    print(f"  {category.capitalize()}: {len(discovered)} discovered, {undiscovered} remaining")
                    if discovered:
                        print(f"    Discovered: {', '.join(discovered)}")
                continue

            response, _ = agent.process_question(user_input)

            print("\nAgent response:")
            print(response)

            # Clear CUDA cache after processing to free up memory
            agent.clear_cuda_cache()

            # Check if everything has been discovered
            if agent.all_discovered():
                print("\n" + "=" * 80)
                print("Congratulations! You've discovered all hidden information!")
                print("=" * 80)
                break

    except Exception as e:
        print(f"An error occurred: {e}")
        print("\nIf you're experiencing memory issues, try one of these alternatives:")
        print("1. Use a smaller model like 'microsoft/phi-2' instead of Mistral-7B")
        print("2. Use an API-based approach with something like OpenAI's API")
        print("3. Try implementing a similar solution with TinyLlama (2.8GB) which fits on most GPUs")


# Usage Examples
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Run the Scenario Agent')
    parser.add_argument('--custom', action='store_true', help='Use custom scenario instead of default')
    parser.add_argument('--model', type=str, default="mistralai/Mistral-7B-Instruct-v0.3",
                        help='Model to use (default: mistralai/Mistral-7B-Instruct-v0.3)')
    args = parser.parse_args()

    if args.custom:
        # Example of creating a custom scenario
        custom_scenario = create_custom_scenario(
            description="A software development team is working on a critical project with tight deadlines. The team's performance varies based on several factors.",
            metrics={
                "development_speed": 75,
                "bug_count": 12,
                "team_morale": 65
            },
            targets={
                "development_speed_target": 90,
                "bug_count_target": 5,
                "team_morale_target": 85
            },
            modifiers={
                "remote_work": "The team recently switched to remote work, causing a temporary 10% decrease in development speed.",
                "new_tools": "The team adopted new debugging tools that could reduce bug count by 30% if the team is properly trained.",
                "deadline_pressure": "Management recently moved up the deadline, causing increased stress and affecting team morale."
            }
        )
        run_scenario_agent(custom_scenario)
    else:
        run_scenario_agent()  # Use default factory scenario
