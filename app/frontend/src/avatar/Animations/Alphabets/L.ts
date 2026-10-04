import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'L'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterL = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandThumb1", "rotation", "z", Math.PI / 4, "+"],
        ["mixamorigRightHand", "rotation", "z", -Math.PI / 2.3, "-"],
        ["mixamorigRightHand", "rotation", "y", -Math.PI / 5, "-"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 2.65, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 30, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 4, "-"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        ["mixamorigRightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandThumb1", "rotation", "z", 0, "-"],
        ["mixamorigRightHand", "rotation", "z", 0, "+"],
        ["mixamorigRightHand", "rotation", "y", 0, "+"],
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
