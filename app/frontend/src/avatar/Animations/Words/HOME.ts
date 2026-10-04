import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for word 'HOME'
 * Multi-frame sequence for complete word gesture
 */
export const createWordHome = (context: AnimationContext): void => {
    // Animation frame 1
    const frame1: AnimationFrame = [
        ["mixamorig:LeftHandThumb1", "rotation", "x", -Math.PI / 3, "-"],
        ["mixamorig:LeftForeArm", "rotation", "x", Math.PI / 70, "+"],
        ["mixamorig:LeftForeArm", "rotation", "z", -Math.PI / 7, "-"],
        ["mixamorig:LeftArm", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorig:RightHandThumb1", "rotation", "x", -Math.PI / 3, "-"],
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 70, "+"],
        ["mixamorig:RightForeArm", "rotation", "z", Math.PI / 7, "+"],
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 6, "-"],
    ];

    context.animations.push(frame1);

    // Animation frame 2
    const frame2: AnimationFrame = [
        ["mixamorig:LeftForeArm", "rotation", "y", -Math.PI / 2.5, "+"],
        ["mixamorig:RightForeArm", "rotation", "y", Math.PI / 2.5, "-"],
    ];

    context.animations.push(frame2);

    // Animation frame 3
    const frame3: AnimationFrame = [
        ["mixamorig:LeftHandThumb1", "rotation", "x", 0, "+"],
        ["mixamorig:LeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorig:LeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorig:LeftArm", "rotation", "x", 0, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "x", 0, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", 0, "-"],
        ["mixamorig:RightForeArm", "rotation", "z", 0, "-"],
        ["mixamorig:RightArm", "rotation", "x", 0, "+"],
        ["mixamorig:LeftForeArm", "rotation", "y", -Math.PI / 1.5, "-"],
        ["mixamorig:RightForeArm", "rotation", "y", Math.PI / 1.5, "+"],
    ];

    context.animations.push(frame3);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
