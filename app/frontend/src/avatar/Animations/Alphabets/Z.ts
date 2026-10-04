import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'Z'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterZ = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "-"],
        ["mixamorigRightHand", "rotation", "y", Math.PI / 4, "+"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 7, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 6.5, "-"],
        ["mixamorigRightArm", "rotation", "z", Math.PI / 2.7, "+"],
        ["mixamorigLeftHandThumb1", "rotation", "x", -Math.PI / 3, "-"],
        ["mixamorigLeftHand", "rotation", "z", Math.PI / 4, "+"],
        ["mixamorigLeftHand", "rotation", "y", -Math.PI / 9, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorigLeftForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorigLeftArm", "rotation", "x", -Math.PI / 5, "-"],
        ["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.7, "-"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigRightHand", "rotation", "z", 0, "+"],
        ["mixamorigRightHand", "rotation", "y", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "-"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
        ["mixamorigRightArm", "rotation", "z", 1.0471975511965976, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "x", 0, "+"],
        ["mixamorigLeftHand", "rotation", "z", 0, "-"],
        ["mixamorigLeftHand", "rotation", "y", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorigLeftArm", "rotation", "x", 0, "+"],
        ["mixamorigLeftArm", "rotation", "z", -1.0471975511965976, "+"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
