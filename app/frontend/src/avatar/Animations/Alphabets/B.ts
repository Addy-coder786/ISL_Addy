import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'B'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterB = (context: AnimationContext): void => {
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
        ["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 6, "-"],
        ["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "-"],
        ["mixamorigRightHand", "rotation", "y", Math.PI / 4, "+"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 9, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 6.5, "-"],
        ["mixamorigLeftHandIndex1", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandIndex2", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandIndex3", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandRing1", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandRing2", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandRing3", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandPinky2", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandPinky3", "rotation", "z", -Math.PI / 4.5, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorigLeftHandThumb2", "rotation", "y", Math.PI / 6, "+"],
        ["mixamorigLeftHand", "rotation", "z", Math.PI / 10, "+"],
        ["mixamorigLeftHand", "rotation", "y", -Math.PI / 4, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 9, "-"],
        ["mixamorigLeftForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorigLeftArm", "rotation", "x", -Math.PI / 6.5, "-"],
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
        ["mixamorigRightHandThumb2", "rotation", "y", 0, "+"],
        ["mixamorigRightHand", "rotation", "z", 0, "+"],
        ["mixamorigRightHand", "rotation", "y", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "-"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
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
        ["mixamorigLeftHandThumb2", "rotation", "y", 0, "-"],
        ["mixamorigLeftHand", "rotation", "z", 0, "-"],
        ["mixamorigLeftHand", "rotation", "y", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorigLeftArm", "rotation", "x", 0, "+"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
