import datetime
import json
from typing import Dict, List, Any, Tuple

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

class Agent:
    def __init__(self):
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