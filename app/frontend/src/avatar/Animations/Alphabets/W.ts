import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'W'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterW = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "y", Math.PI / 16, "+"],
        ["mixamorigRightHandRing1", "rotation", "y", -Math.PI / 12, "-"],
        ["mixamorigRightHandPinky1", "rotation", "y", -Math.PI / 8, "-"],
        ["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 5, "+"],
        ["mixamorigRightHandThumb2", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorigRightHandThumb3", "rotation", "y", Math.PI / 6, "+"],
        ["mixamorigRightHand", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigRightArm", "rotation", "z", Math.PI / 2.4, "+"],
        ["mixamorigLeftHandIndex1", "rotation", "y", -Math.PI / 16, "-"],
        ["mixamorigLeftHandRing1", "rotation", "y", Math.PI / 8, "+"],
        ["mixamorigLeftHandPinky1", "rotation", "y", Math.PI / 8, "+"],
        ["mixamorigLeftHandThumb1", "rotation", "y", -Math.PI / 5, "-"],
        ["mixamorigLeftHandThumb2", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigLeftHandThumb3", "rotation", "y", -Math.PI / 6, "-"],
        ["mixamorigLeftHand", "rotation", "y", -Math.PI / 24, "-"],
        ["mixamorigLeftHand", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.4, "-"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "y", 0, "-"],
        ["mixamorigRightHandRing1", "rotation", "y", 0, "+"],
        ["mixamorigRightHandPinky1", "rotation", "y", 0, "+"],
        ["mixamorigRightHandThumb1", "rotation", "y", 0, "-"],
        ["mixamorigRightHandThumb2", "rotation", "z", 0, "+"],
        ["mixamorigRightHandThumb3", "rotation", "y", 0, "-"],
        ["mixamorigRightHand", "rotation", "x", 0, "+"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightArm", "rotation", "z", 1.0471975511965976, "-"],
        ["mixamorigLeftHandIndex1", "rotation", "y", 0, "+"],
        ["mixamorigLeftHandRing1", "rotation", "y", 0, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "y", 0, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "y", 0, "+"],
        ["mixamorigLeftHandThumb2", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandThumb3", "rotation", "y", 0, "+"],
        ["mixamorigLeftHand", "rotation", "y", 0, "+"],
        ["mixamorigLeftHand", "rotation", "x", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftArm", "rotation", "z", -1.0471975511965976, "+"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
