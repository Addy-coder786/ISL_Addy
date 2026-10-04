import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'H'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterH = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        ["mixamorigRightHandThumb1", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorigRightHandThumb1", "rotation", "z", -Math.PI / 15, "-"],
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 60, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "z", Math.PI / 12, "+"],
        ["mixamorigLeftHand", "rotation", "x", -Math.PI / 1.5, "-"],
        ["mixamorigLeftHand", "rotation", "z", Math.PI / 4, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 1.5, "-"],
        ["mixamorigLeftArm", "rotation", "x", -Math.PI / 30, "-"],
        ["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.6, "-"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        ["mixamorigRightHandThumb1", "rotation", "x", 0, "+"],
        ["mixamorigRightHandThumb1", "rotation", "z", 0, "+"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "-"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
        ["mixamorigLeftHandThumb1", "rotation", "z", 0, "-"],
        ["mixamorigLeftHand", "rotation", "x", 0, "+"],
        ["mixamorigLeftHand", "rotation", "z", 0, "-"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "y", -2.0943951023931953, "+"],
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
