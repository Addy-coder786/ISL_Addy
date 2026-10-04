import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'G'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterG = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandIndex2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandIndex3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"],
        ["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"],
        ["mixamorigRightHand", "rotation", "z", Math.PI / 9, "+"],
        ["mixamorigRightHand", "rotation", "y", -Math.PI / 18, "-"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 12, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 3.5, "-"],
        ["mixamorigRightArm", "rotation", "y", Math.PI / 12, "+"],
        ["mixamorigLeftHandIndex1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandIndex2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandIndex3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandRing1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandRing2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandRing3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandPinky2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandPinky3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "x", Math.PI / 3, "+"],
        ["mixamorigLeftHand", "rotation", "x", -Math.PI / 2.5, "-"],
        ["mixamorigLeftHand", "rotation", "z", -Math.PI / 9, "-"],
        ["mixamorigLeftHand", "rotation", "y", Math.PI / 18, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorigLeftForeArm", "rotation", "x", Math.PI / 12, "+"],
        ["mixamorigLeftArm", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorigLeftArm", "rotation", "y", -Math.PI / 12, "-"],
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
        ["mixamorigRightHand", "rotation", "x", 0, "+"],
        ["mixamorigRightHand", "rotation", "z", 0, "-"],
        ["mixamorigRightHand", "rotation", "y", 0, "+"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "-"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
        ["mixamorigRightArm", "rotation", "y", 0, "-"],
        ["mixamorigLeftHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandIndex3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorigLeftHand", "rotation", "x", 0, "+"],
        ["mixamorigLeftHand", "rotation", "z", 0, "+"],
        ["mixamorigLeftHand", "rotation", "y", 0, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorigLeftArm", "rotation", "x", 0, "+"],
        ["mixamorigLeftArm", "rotation", "y", 0, "+"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
