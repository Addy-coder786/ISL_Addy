import type { AnimationContext, AnimationFrame } from "../types";
import { setDefaultPose } from "../defaultPose";

/**
 * ISL gesture animation for word 'YES'
 * Closed fist gesture with hand rotation
 */
export const createWordYes = (context: AnimationContext): void => {
    // Start with same position as GOODBYE first frame
    const frame1: AnimationFrame = [
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 6, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3.5, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorig:RightHand", "rotation", "y", -Math.PI / 8, "-"],
    ];

    context.animations.push(frame1);

    // close fist (similar to GOODBYE)
    const closeFist: AnimationFrame = [
        ["mixamorig:RightHandIndex1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandIndex2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandIndex3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", Math.PI / 1.5, "+"],
        ["mixamorig:RightHandRing1", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorig:RightHandRing2", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorig:RightHandRing3", "rotation", "z", Math.PI / 1.6, "+"],
        ["mixamorig:RightHandPinky1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandPinky2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandPinky3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "x", Math.PI / 2.3, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "y", -Math.PI / 25, "-"],
    ];

    context.animations.push(closeFist);

    // rotate hand inward and rotate so the fist points down perpendicularly
    const rotateHand: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "y", -Math.PI / 4, "-"],
        // rotate the hand around the x-axis so that knuckles/fist point downward
        // using negative rotation because the rig's local x produces the inverse direction
        ["mixamorig:RightHand", "rotation", "x", -Math.PI / 2.0, "+"],
        // slight forearm z rotation to maintain perpendicular alignment visually
        ["mixamorig:RightForeArm", "rotation", "z", Math.PI / 20, "+"],
    ];

    context.animations.push(rotateHand);

    // return to home position
    const reset: AnimationFrame = [
        ["mixamorig:RightHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandIndex2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandIndex3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorig:RightHandThumb1", "rotation", "y", 0, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", 0, "-"],
        ["mixamorig:RightForeArm", "rotation", "z", 0, "-"],
        ["mixamorig:RightHand", "rotation", "x", 0, "-"],
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
