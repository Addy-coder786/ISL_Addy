import type { AnimationContext, AnimationFrame } from "../types";
import { setDefaultPose } from "../defaultPose";

/**
 * ISL gesture animation for word 'THANK YOU'
 * Right hand from chin outwards
 */
export const createWordThankYou = (context: AnimationContext): void => {
    // Bring hand near chin with an open palm facing roughly outward
    const frame1: AnimationFrame = [
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 4, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 12, "+"],
        ["mixamorig:RightHand", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 6, "+"],
    ];
    context.animations.push(frame1);

    // One outward push from the chin to slightly forward (single expressive motion)
    const frame2: AnimationFrame = [
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 8, "+"],
    ];
    context.animations.push(frame2);

    // Small hold on the final frame so it's readable
    context.animations.push([
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 8, "+"],
    ]);

    // Reset all the bones back to a neutral pose
    const reset: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "z", 0, "-"],
        ["mixamorig:RightHand", "rotation", "x", 0, "-"],
        ["mixamorig:RightHand", "rotation", "y", 0, "-"],
        ["mixamorig:RightForeArm", "rotation", "x", 0, "-"],
        ["mixamorig:RightArm", "rotation", "x", 0, "+"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3, "-"],
    ];
    context.animations.push(reset);

    // Small pause then reset to default neutral pose
    context.animations.push([]);
    setDefaultPose(context);

    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};
