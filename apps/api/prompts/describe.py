"""
VisionSathi - Description Prompts

Prompts for different modes and verbosity levels.
"""


PROMPTS = {
    "describe": {
        "brief": (
            "Describe what you see in one clear sentence. "
            "Focus on the most important element for someone who cannot see."
        ),
        "normal": (
            "Describe this scene for a blind person. "
            "Include the main objects, their approximate positions, and any text visible. "
            "Be concise but informative."
        ),
        "detailed": (
            "Describe this scene in detail for a blind person. Include:\n"
            "- Main objects and their positions (left, right, center, near, far)\n"
            "- Approximate distances when relevant\n"
            "- Any text, signs, or labels visible\n"
            "- People present (without identifying individuals)\n"
            "- Lighting conditions\n"
            "- Potential obstacles or hazards\n"
            "Be thorough but organized."
        ),
    },
    "read": {
        "brief": "Read the main text visible in this image.",
        "normal": (
            "Read all text visible in this image. "
            "Present it in reading order (top to bottom, left to right)."
        ),
        "detailed": (
            "Read all text visible in this image carefully. "
            "Present it in reading order, and for each piece of text, note:\n"
            "- The type (sign, label, document, screen, etc.)\n"
            "- Its location in the image\n"
            "- The complete text content\n"
            "If text is partially visible or unclear, indicate that."
        ),
    },
    "navigate": {
        "brief": (
            "Is the path ahead clear? Mention any obstacles briefly."
        ),
        "normal": (
            "Analyze this scene for navigation assistance:\n"
            "- Is the path ahead clear? How far?\n"
            "- Any obstacles? Where are they?\n"
            "- Any doors or exits visible?\n"
            "Start with the most important safety information."
        ),
        "detailed": (
            "Provide detailed navigation assistance for a blind person:\n"
            "1. Path ahead: Clear or obstructed? Approximate clear distance?\n"
            "2. Obstacles: List each with type, position (left/right/center), "
            "approximate distance, and risk level\n"
            "3. Exits/doors: Location and type (open/closed)\n"
            "4. Floor: Any changes in level, stairs, curbs, or surface?\n"
            "5. Hazards: Any immediate safety concerns?\n"
            "Prioritize safety-critical information first."
        ),
    },
}


def get_prompt_for_mode(mode: str, verbosity: str) -> str:
    """
    Get the appropriate prompt for the given mode and verbosity.

    Args:
        mode: Analysis mode (describe, read, navigate)
        verbosity: Response length (brief, normal, detailed)

    Returns:
        The prompt string to use with Moondream
    """
    mode_prompts = PROMPTS.get(mode, PROMPTS["describe"])
    return mode_prompts.get(verbosity, mode_prompts["normal"])
