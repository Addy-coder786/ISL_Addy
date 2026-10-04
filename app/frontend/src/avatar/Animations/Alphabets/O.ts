import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'O'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterO = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        // Right hand forms a rounded "O"
        ["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 3.5, "+"],
        ["mixamorigRightHandIndex2", "rotation", "z", Math.PI / 3.5, "+"],
        ["mixamorigRightHandIndex3", "rotation", "z", Math.PI / 3.5, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 3.8, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 3.8, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 3.8, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 3.8, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 3.8, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 3.8, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 3.6, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 3.6, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 3.6, "+"],
        ["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"],
        ["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 3, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3.2, "-"],
        ["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 3.2, "-"],
        ["mixamorigRightHand", "rotation", "z", -Math.PI / 12, "-"],
        ["mixamorigRightHand", "rotation", "y", Math.PI / 6, "+"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 8, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 7, "-"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandIndex2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandIndex3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorigRightHandThumb1", "rotation", "y", 0, "-"],
        ["mixamorigRightHandThumb2", "rotation", "y", 0, "+"],
        ["mixamorigRightHandThumb3", "rotation", "y", 0, "+"],
        ["mixamorigRightHand", "rotation", "z", 0, "+"],
        ["mixamorigRightHand", "rotation", "y", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "-"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
