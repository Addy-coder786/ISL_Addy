import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'J'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterJ = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"],
        ["mixamorigRightHandThumb1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHand", "rotation", "y", -Math.PI / 5, "-"],
        ["mixamorigRightHand", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigRightArm", "rotation", "y", Math.PI / 6, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 36, "-"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandRing1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandRing2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandRing3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandPinky2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandPinky3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "y", -Math.PI / 2, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 3.7, "-"],
        ["mixamorigLeftForeArm", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.4, "-"],
        ["mixamorigLeftHand", "rotation", "z", -Math.PI / 7, "-"],
        ["mixamorigLeftHand", "rotation", "x", -Math.PI / 3, "-"],
        ["mixamorigLeftHand", "rotation", "y", Math.PI / 12, "+"],
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
        ["mixamorigRightHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorigRightHandThumb1", "rotation", "z", 0, "-"],
        ["mixamorigRightHand", "rotation", "y", 0, "+"],
        ["mixamorigRightHand", "rotation", "z", 0, "-"],
        ["mixamorigRightArm", "rotation", "y", 0, "-"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandThumb1", "rotation", "y", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "+"],
        ["mixamorigLeftArm", "rotation", "z", -1.0471975511965976, "+"],
        ["mixamorigLeftHand", "rotation", "z", 0, "+"],
        ["mixamorigLeftHand", "rotation", "x", 0, "+"],
        ["mixamorigLeftHand", "rotation", "y", 0, "-"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
