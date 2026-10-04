import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'S'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterS = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandIndex2", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandIndex3", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", -Math.PI / 4, "-"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 2.5, "-"],
        ["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 2.5, "-"],
        ["mixamorigRightHand", "rotation", "y", Math.PI / 6, "+"],
        ["mixamorigRightHand", "rotation", "x", Math.PI / 3, "+"],
        ["mixamorigRightHand", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigRightArm", "rotation", "y", Math.PI / 33, "+"],
        ["mixamorigRightArm", "rotation", "z", Math.PI / 2.6, "+"],
        ["mixamorigLeftHandIndex1", "rotation", "z", -Math.PI / 1.6, "-"],
        ["mixamorigLeftHandIndex2", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandIndex3", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", -Math.PI / 1.6, "-"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandRing1", "rotation", "z", -Math.PI / 1.6, "-"],
        ["mixamorigLeftHandRing2", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandRing3", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "z", Math.PI / 4, "+"],
        ["mixamorigLeftHandPinky2", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandPinky3", "rotation", "z", -Math.PI / 3, "-"],
        ["mixamorigLeftHandThumb2", "rotation", "y", Math.PI / 2.5, "+"],
        ["mixamorigLeftHandThumb3", "rotation", "y", Math.PI / 2.5, "+"],
        ["mixamorigLeftHand", "rotation", "z", -Math.PI / 10, "-"],
        ["mixamorigLeftHand", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", Math.PI / 2.7, "+"],
        ["mixamorigLeftForeArm", "rotation", "y", -Math.PI * 0.75, "-"],
        ["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.6, "-"],
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
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandThumb2", "rotation", "y", 0, "+"],
        ["mixamorigRightHandThumb3", "rotation", "y", 0, "+"],
        ["mixamorigRightHand", "rotation", "y", 0, "-"],
        ["mixamorigRightHand", "rotation", "x", 0, "-"],
        ["mixamorigRightHand", "rotation", "z", 0, "+"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightArm", "rotation", "y", 0, "-"],
        ["mixamorigRightArm", "rotation", "z", 1.0471975511965976, "-"],
        ["mixamorigLeftHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandIndex3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandPinky2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandThumb2", "rotation", "y", 0, "-"],
        ["mixamorigLeftHandThumb3", "rotation", "y", 0, "-"],
        ["mixamorigLeftHand", "rotation", "z", 0, "+"],
        ["mixamorigLeftHand", "rotation", "x", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "-"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorigLeftForeArm", "rotation", "y", -2.0943951023931953, "+"],
        ["mixamorigLeftArm", "rotation", "z", -1.0471975511965976, "+"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
