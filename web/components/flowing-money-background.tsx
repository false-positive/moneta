"use client";

import { useState, useEffect } from "react";
import { Coins, DollarSign, Banknote } from "lucide-react";

export function FlowingMoneyBackground({ color = "#8e44ad", opacity = 0.15 }) {
	const [moneyItems, setMoneyItems] = useState<
		{
			id: number;
			left: number;
			delay: number;
			size: number;
			rotate: number;
			type: string;
			speed: number;
		}[]
	>([]);

	useEffect(() => {
		const items = Array.from({ length: 30 }, (_, i) => {
			const types = ["coin", "dollar", "banknote"];
			const type = types[Math.floor(Math.random() * types.length)];

			return {
				id: i,
				left: Math.random() * 90 + 5,
				delay: 0,
				size: Math.random() * 16 + 32,
				rotate: Math.random() * 360,
				type: type,
				speed: Math.random() * 10 + 10,
			};
		});
		setMoneyItems(items);
	}, []);

	const renderMoneyIcon = (type: string, size: number) => {
		switch (type) {
			case "coin":
				return <Coins size={size} />;
			case "dollar":
				return <DollarSign size={size} />;
			case "banknote":
				return <Banknote size={size} />;
			default:
				return <Coins size={size} />;
		}
	};

	const animationKeyframes = `
    @keyframes float-money {
      0% {
        transform: translateY(0) rotate(var(--rotate));
        opacity: 0;
      }
      10% {
        opacity: var(--opacity);
      }
      90% {
        opacity: var(--opacity);
      }
      100% {
        transform: translateY(-120vh) rotate(calc(var(--rotate) + 20deg));
        opacity: 0;
      }
    }
  `;

	return (
		<>
			<style jsx>{animationKeyframes}</style>
			{moneyItems.map((item) => (
				<div
					key={item.id}
					className="absolute"
					style={
						{
							left: `${item.left}%`,
							top: "120%",
							transform: `rotate(${item.rotate}deg)`,
							opacity:
								item.type === "coin" ? opacity + 0.05 : opacity,
							animation: `float-money ${item.speed}s linear infinite`,
							animationDelay: `${item.delay}s`,
							"--rotate": `${item.rotate}deg`,
							"--opacity":
								item.type === "coin" ? opacity + 0.05 : opacity,
							color: color,
						} as React.CSSProperties
					}
				>
					{renderMoneyIcon(item.type, item.size)}
				</div>
			))}
		</>
	);
}
