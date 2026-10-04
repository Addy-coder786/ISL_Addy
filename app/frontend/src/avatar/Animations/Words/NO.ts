import type { AnimationContext, AnimationFrame } from "../types";
import { setDefaultPose } from "../defaultPose";

/**
 * ISL gesture animation for word 'NO'
 * Two fingers (index & middle) closed on thumb
 */
export const createWordNo = (context: AnimationContext): void => {
    // Start with same position as YES first frame
    const frame1: AnimationFrame = [
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3.5, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorig:RightHand", "rotation", "y", -Math.PI / 8, "-"],
    ];

    context.animations.push(frame1);

    // Close index and middle fingers on thumb
    const closeFingers: AnimationFrame = [
        ["mixamorig:RightHandIndex1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandIndex2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandIndex3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "x", Math.PI / 2.3, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "y", -Math.PI / 25, "-"],
    ];

    context.animations.push(closeFingers);

    // Small left-right movement
    const frame2: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "z", Math.PI / 12, "+"],
    ];

    const frame3: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "z", -Math.PI / 12, "-"],
    ];

    context.animations.push(frame2);
    context.animations.push(frame3);

    // Return to home position
    const reset: AnimationFrame = [
        ["mixamorig:RightHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandIndex2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandIndex3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorig:RightHandThumb1", "rotation", "y", 0, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", 0, "-"],
        ["mixamorig:RightHand", "rotation", "y", 0, "+"],
        ["mixamorig:RightArm", "rotation", "x", 0, "+"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3, "-"],
    ];

    context.animations.push(reset);
    // push a small empty frame for pause
    context.animations.push([]);
    // Queue default neutral pose explicitly
    setDefaultPose(context);

    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
