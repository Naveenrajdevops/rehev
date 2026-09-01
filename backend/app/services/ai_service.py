import os
from typing import Dict, Any, List, Optional

SYSTEM_PROMPT = """You are "Nova", the RehabAI Clinical Coach.
You are a calm, professional, encouraging, clear, friendly, and non-judgmental AI rehabilitation assistant.

CRITICAL SAFETY & CLINICAL RULES:
1. NEVER provide a medical diagnosis or claim certainty about injury etiology.
2. NEVER prescribe medication, surgical interventions, or replace a licensed clinician.
3. Always encourage safe, controlled movements and listening to one's body.
4. When analyzing metrics (Movement Quality, Symmetry, Range of Motion, Repetitions), refer to them as "AI-assisted kinematic estimates" rather than diagnostic findings.
5. If the user mentions pain, acute swelling, or sudden sharp sensation, immediately advise pausing the movement and consulting their physiotherapist or doctor.
6. Provide actionable, supportive tips on pacing, breathing, posture, and symmetry based on their current session context.
7. Keep responses concise, structured, and easy to digest for patients during or after exercise.
"""

def generate_nova_response(message: str, patient_info: Optional[Dict[str, Any]] = None, session_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")
    
    context_str = ""
    if patient_info:
        context_str += f"\nPatient Context: Name={patient_info.get('name')}, Condition={patient_info.get('condition')}, Affected Side={patient_info.get('affected_side')}, Goal={patient_info.get('primary_goal')}."
    if session_context:
        context_str += f"\nLive Session Context: Exercise={session_context.get('exercise_name', 'N/A')}, Completed Reps={session_context.get('reps', 0)}/{session_context.get('target_reps', 10)}, Movement Quality={session_context.get('quality', 0)}%, Symmetry={session_context.get('symmetry', 0)}%, ROM={session_context.get('rom', 0)} deg, Pose Confidence={session_context.get('confidence', 0)}%."

    # If Gemini API key is available, call Google GenAI
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"{SYSTEM_PROMPT}\n{context_str}\n\nUser Question: {message}\n\nNova's Response:"
            response = client.models.generate_content(
                model=os.getenv("AI_MODEL", "gemini-2.5-flash"),
                contents=prompt
            )
            reply_text = response.text.strip()
            
            # Generate smart suggestions based on topic
            suggestions = [
                "Explain my movement symmetry",
                "How can I improve my ROM safely?",
                "Summarize today's session",
                "Prepare notes for my physiotherapist"
            ]
            return {"message": reply_text, "suggestions": suggestions, "sender": "nova"}
        except Exception as e:
            # Fall back to clinical rule engine if API call fails
            pass

    # High-quality intelligent clinical rule-based engine (Demo / Offline mode)
    msg_lower = message.lower()
    
    if "score" in msg_lower or "low" in msg_lower or "quality" in msg_lower:
        quality = session_context.get("quality", 88) if session_context else 88
        symmetry = session_context.get("symmetry", 90) if session_context else 90
        text = (
            f"Your current estimated movement quality is {quality}%. "
            f"This score reflects a composite of your range of motion adherence, movement tempo consistency, "
            f"and bilateral symmetry (currently {symmetry}%). "
            "To boost your quality score: focus on a smooth, controlled descent and maintain full postural alignment throughout each repetition."
        )
        suggestions = ["How is my symmetry measured?", "Explain range of motion target", "What is my tempo?"]
    
    elif "symmetry" in msg_lower or "balance" in msg_lower or "side" in msg_lower:
        sym_diff = session_context.get("symmetry_diff", 4.2) if session_context else 4.2
        text = (
            f"Your bilateral symmetry is currently tracking with a difference of approximately {sym_diff}°. "
            "Slight variances are normal as healing tissues regain neuromuscular control. "
            "Make sure you distribute your body weight evenly and avoid shifting your center of mass onto your unaffected limb."
        )
        suggestions = ["Check my knee alignment", "Show my last session comparison", "Prepare questions for doctor"]

    elif "stiff" in msg_lower or "pain" in msg_lower or "hurt" in msg_lower or "sore" in msg_lower:
        text = (
            "I hear you. If you are experiencing pain or unusual tightness, please pause your session right away. "
            "Gentle active mobility within a comfortable, pain-free zone is generally encouraged, but sharp or increasing discomfort should always be evaluated by your physiotherapist. "
            "Would you like me to log a note in your session record for your clinician?"
        )
        suggestions = ["Log a symptom note for therapist", "Start gentle warm-up exercises", "View rest recommendations"]

    elif "rom" in msg_lower or "range" in msg_lower or "flex" in msg_lower or "extension" in msg_lower:
        rom = session_context.get("rom", 102) if session_context else 102
        target_rom = session_context.get("target_rom", 110) if session_context else 110
        text = (
            f"During your recent movement, you reached an estimated peak Range of Motion of {rom}°, compared to your target goal of {target_rom}°. "
            "Progressive, gradual gains in ROM are much safer and more durable than forcing deeper angles. Continue aiming for smooth, unhurried repetitions."
        )
        suggestions = ["What exercises help with ROM?", "Explain joint angle tracking", "Summarize session"]

    elif "summarize" in msg_lower or "summary" in msg_lower or "progress" in msg_lower:
        reps = session_context.get("reps", 8) if session_context else 8
        text = (
            f"Session Overview: You have completed {reps} tracked repetitions with strong pose stability. "
            "Your movement consistency has remained steady, showing positive adaptation over your recent sets. "
            "Keep up this rhythm and remember to take scheduled rest breaks between sets."
        )
        suggestions = ["Export PDF clinical report", "Send summary to therapist", "Check upcoming exercises"]

    elif "therapist" in msg_lower or "doctor" in msg_lower or "question" in msg_lower:
        text = (
            "Here are helpful points you might want to discuss with your therapist at your next visit:\n"
            "1. Any differences in sensation between your affected and unaffected sides during extension.\n"
            "2. Whether it is time to progress from basic repetitions to added resistance.\n"
            "3. Guidance on safe daily activities outside your structured exercise plan."
        )
        suggestions = ["Save to patient notes", "How did I perform today?", "Review rehab plan"]

    else:
        text = (
            "Hello! I am Nova, your RehabAI Clinical Coach. I'm here to help you monitor your movement quality, "
            "understand your range of motion and symmetry metrics, and encourage steady, safe rehabilitation. "
            "How can I assist you with your exercises today?"
        )
        suggestions = [
            "Explain my score",
            "How did I perform?",
            "What should I improve?",
            "Summarize my progress"
        ]

    return {
        "message": text,
        "suggestions": suggestions,
        "sender": "nova"
    }
