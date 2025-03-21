from typing import Dict, List, Any, Tuple

import torch

from services.flask.agent import Agent

class ActionsAgent():
    def __init__(self, root_agent: Agent, actions: Dict[str, Any]):
        self.agent = root_agent

        self.actions = actions

        # Conversation history
        self.conversation_history = {}

    def set_root_agent(self, root_agent):
        self.agent = root_agent

    def set_actions(self, actions: Dict[str, Any]) -> None:
        """Set the available actions for the agent."""
        self.actions = actions

    def _create_system_prompt(self) -> str:
        return f"""You are a concise and insightful finance advisor, tasked with providing clear and relevant summaries of investment actions. Your goal is to explain each action in simple terms, focusing on its mechanics, risks, and potential impact while maintaining a professional and neutral tone.

You have access to the following investment actions:
AVAILABLE ACTIONS:
{self.actions}

Response Guidelines:

    Structured Response: Begin with a headline that names the action (e.g., "ETF Investment Overview"). Follow with a brief overview paragraph explaining what the action is, using 2-3 sentences maximum.
    Separate Impact Forecast: In a new paragraph titled "Impact Forecast:" provide a concise forecast of the potential impact. Describe the effect on the investment in qualitative terms (e.g., growth prospects, market fluctuations, diversification benefits) without relying on explicit numerical projections or specific data.
    Stay Focused: Your first response must strictly address the current action without referencing other available actions. If the user wishes to explore further, you may introduce comparisons or alternatives in follow-ups.
    Be Concise: Keep explanations short and to the point, ensuring clarity and brevity.
    Stay Focused: Your first response must strictly address the current action without referencing other available actions. If the user wishes to explore further, you may introduce comparisons or alternatives in follow-ups.
    BE VERY CONCISE(MAX 2 - 3 Sentences (Around 500 characters MAX unless follow up prompt), Including the forecast of the impact, which should be in another paragraph), DO NOT PROVIDE NUMERICAL PROJECTIONS OR SPECIFIC DATA.

Your responses should mirror the following style:

ETF Investment Overview

An Exchange-Traded Fund (ETF) is a diversified investment that trades like a stock, offering exposure to multiple assets while maintaining liquidity and lower costs compared to individual stock purchases. ETFs can track broad market indices, sectors, or specific investment strategies.

Impact Forecast:
Investing in an ETF may support steady, long-term capital growth, while market fluctuations could result in short-term value swings. Over the medium term, the benefits of diversification and compounding may enhance overall portfolio stability."""

    def add_message(self, role: str, content: str, action_name: str) -> None:
        """Add a message to the conversation history."""
        self.conversation_history[action_name].append({"role": role, "content": content})

    def process_question(self, action_name: str, user_question: str) -> Tuple[str, Dict[str, List[str]]]:
        """
        Process a user question, generate a response, and check if any
        hidden information has been discovered.

        Args:
            user_question: The user's question

        Returns:
            Tuple containing (agent_response, discovered_info)
        """
        if action_name not in (self.conversation_history.keys()) or len(self.conversation_history[action_name]):
            self.conversation_history[action_name] = []
            self.add_message("system", self._create_system_prompt(), action_name)

        # Add user question to history
        if len(self.conversation_history[action_name]) >= 2:
            self.conversation_history[action_name][1]["content"] += f"\n{user_question}"
        else:
            self.add_message("user", user_question, action_name)

        # Generate response from the model
        messages = self.conversation_history[action_name].copy()

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

        except Exception as e:
            print(f"Error during generation: {e}")
            response = "I apologize, but I'm having difficulty processing that request. Could you rephrase your question?"

        # Add assistant response to history
        #self.add_message("assistant", response)

        return response


if __name__ == "__main__":
    ACTIONS = {
        "ETF Investments": {
            "description": """An exchange-traded fund (ETF) is an investment fund that holds multiple underlying assets and can be bought and sold on an exchange, much like an individual stock. ETFs can be structured to track anything from the price of a commodity to a large and diverse collection of stocks.
ETFs can even be designed to track specific investment strategies. Various types of ETFs are available to investors for income generation, speculation, or hedging risk in an investor’s portfolio. The first ETF in the U.S. was the SPDR S&P 500 ETF (SPY), which tracks the S&P 500 Index.1
Key Takeaways
    An exchange-traded fund (ETF) is a basket of securities that trades on an exchange just like a stock.
    ETF share prices fluctuate throughout the trading day; this is different from mutual funds, which only trade once a day after the market closes.
    ETFs offer low expense ratios and fewer brokerage commissions than buying stocks individually.

An ETF must be registered with the Securities and Exchange Commission (SEC). In the United States, most ETFs are set up as open-ended funds and are subject to the Investment Company Act of 1940, except where subsequent rules have modified their regulatory requirements.2 Open-ended funds do not limit the number of investors involved in the product.
Vanguard's Consumer Staples ETF (VDC) tracks the MSCI US Investable Market Consumer Staples 25/50 Index and has a minimum investment of $1.00. The fund holds shares of all 104 companies on the index, some familiar to most because they produce or sell consumer items. A few of the companies held by VDC are Proctor & Gamble, Costco, Coca-Cola, Walmart, and PepsiCo.34
There is no transfer of ownership because investors buy a share of the fund, which owns the shares of the underlying companies. Unlike mutual funds, ETF share prices are determined throughout the day. A mutual fund trades only once a day after the markets close.""",
            "impact": "4% YoY growth",
            "risks": "Market volatility",
        },
        "Government bonds": {
            "description": """A bond is a fixed-income instrument and investment product where individuals lend money to a government or company at a certain interest rate for an amount of time. The entity repays individuals with interest in addition to the original face value of the bond.

Bonds are used by companies, municipalities, states, and sovereign governments to finance projects and operations. Owners of bonds are debtholders, or creditors, of the issuer. Bond details include the end date when the principal of the loan is due to be paid to the bond owner and usually include the terms for variable or fixed interest payments made by the borrower.
Key Takeaways

    A bond is referred to as a fixed-income instrument since bonds traditionally pay a fixed interest rate or coupon to debtholders.
    Bond prices are inversely correlated with interest rates: when rates go up, bond prices fall, and vice-versa.
    Bonds have maturity dates at which point the principal amount must be paid back in full or risk default.

Bonds are debt instruments and represent loans made to the issuer. Bonds allow individual investors to assume the role of the lender. Governments and corporations commonly use bonds to borrow money to fund roads, schools, dams, or other infrastructure. Corporations often borrow to grow their business, buy property and equipment, undertake profitable projects, for research and development, or to hire employees.

Bonds are fixed-income securities and are one of the main asset classes for individual investors, along with equities and cash equivalents. The borrower issues a bond that includes the terms of the loan, interest payments that will be made, and the maturity date the bond principal must be paid back. The interest payment is part of the return that bondholders earn for loaning their funds to the issuer. The interest rate that determines the payment is called the coupon rate.

The initial price of most bonds is typically set at par or $1,000 face value per individual bond. The actual market price of a bond depends on the credit quality of the issuer, the length of time until expiration, and the coupon rate compared to the general interest rate environment. The face value of the bond is what is paid to the lender once the bond matures.5 """,
            "impact": "2% YoY growth",
            "risks": "Interest rate changes",
        },
        "Cryptocurrency": {
            "description": """ A cryptocurrency is a digital or virtual currency secured by cryptography, which makes it nearly impossible to counterfeit or double-spend. Most cryptocurrencies exist on decentralized networks using blockchain technology—a distributed ledger enforced by a disparate network of computers.

A defining feature of cryptocurrencies is that they are generally not issued by any central authority, rendering them theoretically immune to government interference or manipulation.
Key Takeaways

    A cryptocurrency is a form of digital asset based on a network that is distributed across a large number of computers. This decentralized structure allows them to exist outside the control of governments and central authorities.
    Some experts believe blockchain and related technologies will disrupt many industries, including finance and law.
    The advantages of cryptocurrencies include cheaper and faster money transfers and decentralized systems that do not collapse at a single point of failure.
    The disadvantages of cryptocurrencies include their price volatility, high energy consumption for mining activities, and use in criminal activities.

Cryptocurrencies are digital or virtual currencies underpinned by cryptographic systems. They enable secure online payments without the use of third-party intermediaries. "Crypto" refers to the various encryption algorithms and cryptographic techniques that safeguard these entries, such as elliptical curve encryption, public-private key pairs, and hashing functions.

Central to the appeal and functionality of Bitcoin and other cryptocurrencies is blockchain technology. As its name indicates, a blockchain is essentially a set of connected blocks of information on an online ledger. Each block contains a set of transactions that have been independently verified by each validator on a network.

Every new block generated must be verified before being confirmed, making it almost impossible to forge transaction histories. The contents of the online ledger must be agreed upon by a network of individual nodes, or computers that maintain the ledger.

Experts say that blockchain technology can serve multiple industries, supply chains, and processes such as online voting and crowdfunding. Financial institutions such as JPMorgan Chase & Co. (JPM) are using blockchain technology to lower transaction costs by streamlining payment processing.""",
            "impact": "20% YoY growth",
            "risks": "Market volatility",
        }
    }

    agent = ActionsAgent(actions=ACTIONS)

    print("Agent initialized successfully!")
    print("Agent ready to process questions.")

    actions = agent.process_question("ETF Investment - One-off", "Explain about ETFs. I have about 5000$ currently that i want to invest. I have high risk tolerance and want fast returns.")

    print(actions)

    actions = agent.process_question("ETF Investment - One-off", "Can you compare it to Crypto?")

    print(actions)