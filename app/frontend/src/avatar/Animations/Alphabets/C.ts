import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'C'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterC = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandIndex2", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandIndex3", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 4.5, "+"],
        ["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"],
        ["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 3, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 6, "-"],
        ["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 7, "-"],
        ["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "-"],
        ["mixamorigRightHand", "rotation", "y", Math.PI / 4, "+"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 9, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 6.5, "-"],
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
