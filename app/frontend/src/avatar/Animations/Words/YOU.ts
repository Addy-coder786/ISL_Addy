import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for word 'YOU'
 * Multi-frame sequence for complete word gesture
 */
export const createWordYou = (context: AnimationContext): void => {
    // Animation frame 1
    const frame1: AnimationFrame = [
        ["mixamorig:RightHandMiddle1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandRing1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandRing2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandRing3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandThumb2", "rotation", "y", -Math.PI / 2, "-"],
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorig:RightHand", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorig:RightHand", "rotation", "z", Math.PI / 3, "+"],
        ["mixamorig:RightHand", "rotation", "y", -Math.PI / 6, "-"],
    ];

    context.animations.push(frame1);

    // Animation frame 2
    const frame2: AnimationFrame = [
        ["mixamorig:RightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandThumb2", "rotation", "y", 0, "+"],
        ["mixamorig:RightArm", "rotation", "x", 0, "+"],
        ["mixamorig:RightHand", "rotation", "x", 0, "-"],
        ["mixamorig:RightHand", "rotation", "z", 0, "-"],
        ["mixamorig:RightHand", "rotation", "y", 0, "+"],
    ];

    context.animations.push(frame2);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
