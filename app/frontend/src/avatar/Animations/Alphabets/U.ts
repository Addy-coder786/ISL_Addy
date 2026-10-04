import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'U'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterU = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigLeftHandIndex1", "rotation", "y", -Math.PI / 9, "-"],
        ["mixamorigLeftHandMiddle1", "rotation", "y", -Math.PI / 18, "-"],
        ["mixamorigLeftHandRing1", "rotation", "y", Math.PI / 18, "+"],
        ["mixamorigLeftHandPinky1", "rotation", "y", Math.PI / 9, "+"],
        ["mixamorigLeftHand", "rotation", "x", Math.PI / 1.45, "+"],
        ["mixamorigLeftHand", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigLeftHand", "rotation", "y", Math.PI / 36, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", Math.PI / 9, "+"],
        ["mixamorigLeftArm", "rotation", "y", -Math.PI / 12, "-"],
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 2.5, "-"],
        ["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 2.5, "-"],
        ["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"],
        ["mixamorigRightHand", "rotation", "z", Math.PI / 12, "+"],
        ["mixamorigRightHand", "rotation", "y", Math.PI / 15, "+"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigRightForeArm", "rotation", "x", -Math.PI / 36, "-"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 13, "-"],
        ["mixamorigRightArm", "rotation", "y", Math.PI / 18, "+"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        ["mixamorigLeftHandIndex1", "rotation", "y", 0, "+"],
        ["mixamorigLeftHandMiddle1", "rotation", "y", 0, "+"],
        ["mixamorigLeftHandRing1", "rotation", "y", 0, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "y", 0, "-"],
        ["mixamorigLeftHand", "rotation", "x", 0, "-"],
        ["mixamorigLeftHand", "rotation", "z", 0, "-"],
        ["mixamorigLeftHand", "rotation", "y", 0, "-"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorigLeftArm", "rotation", "y", 0, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandThumb2", "rotation", "y", 0, "+"],
        ["mixamorigRightHandThumb3", "rotation", "y", 0, "+"],
        ["mixamorigRightHand", "rotation", "x", 0, "+"],
        ["mixamorigRightHand", "rotation", "z", 0, "-"],
        ["mixamorigRightHand", "rotation", "y", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "+"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
        ["mixamorigRightArm", "rotation", "y", 0, "-"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
