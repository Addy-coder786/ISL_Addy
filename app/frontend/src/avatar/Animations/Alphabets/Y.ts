import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'Y'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterY = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 2.5, "-"],
        ["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 2.5, "-"],
        ["mixamorigRightHand", "rotation", "z", +Math.PI / 2.5, "+"],
        ["mixamorigRightHand", "rotation", "x", -Math.PI / 8, "-"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 15, "+"],
        ["mixamorigRightForeArm", "rotation", "x", -Math.PI / 10, "-"],
        ["mixamorigRightArm", "rotation", "y", Math.PI / 33, "+"],
        ["mixamorigRightArm", "rotation", "z", Math.PI / 2.2, "+"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", -Math.PI / 1.5, "-"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", -Math.PI / 1.5, "-"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", -Math.PI / 1.5, "-"],
        ["mixamorigLeftHandRing1", "rotation", "z", -Math.PI / 1.6, "-"],
        ["mixamorigLeftHandRing2", "rotation", "z", -Math.PI / 1.6, "-"],
        ["mixamorigLeftHandRing3", "rotation", "z", -Math.PI / 1.6, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandPinky2", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandPinky3", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "y", -Math.PI / 4, "-"],
        ["mixamorigLeftHand", "rotation", "y", Math.PI / 2, "+"],
        ["mixamorigLeftHand", "rotation", "x", Math.PI / 2, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 3.5, "-"],
        ["mixamorigLeftArm", "rotation", "x", -Math.PI / 5, "-"],
        ["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.2, "-"],
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
        ["mixamorigRightHandThumb2", "rotation", "y", 0, "+"],
        ["mixamorigRightHandThumb3", "rotation", "y", 0, "+"],
        ["mixamorigRightHand", "rotation", "z", 0, "-"],
        ["mixamorigRightHand", "rotation", "x", 0, "+"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "+"],
        ["mixamorigRightArm", "rotation", "y", 0, "-"],
        ["mixamorigRightArm", "rotation", "z", 1.0471975511965976, "-"],
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
        ["mixamorigLeftHand", "rotation", "y", 0, "-"],
        ["mixamorigLeftHand", "rotation", "x", 0, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
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
