import type { AnimationContext, AnimationFrame } from "../types";
import { setDefaultPose } from "../defaultPose";

/**
 * ISL gesture animation for word 'HELLO'
 * Right-hand wave near head
 */
export const createWordHello = (context: AnimationContext): void => {
    // Bring the hand to the side of the head, palm out. Lift and slightly rotate the arm.
    const frame1: AnimationFrame = [
        // Upper arm: lift up (x negative) and bring towards the head (z smaller positive)
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 3, "-"], // ~-60° lift
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 4, "+"], // ~45° outwards
        // Forearm: bend so hand is near ear/head
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 6, "+"], // bend elbow
        // Hand: rotate to palm-out orientation (y axis), slightly rotate for correct angle
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 4, "+"], // ~45° palm out
        ["mixamorig:RightHand", "rotation", "z", -Math.PI / 12, "-"], // small tilt
        // Straighten fingers for a clear open palm
        ["mixamorig:RightHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandIndex3", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandRing1", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandRing2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandRing3", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandPinky1", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandPinky2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandPinky3", "rotation", "z", 0, "+"],
    ];

    context.animations.push(frame1);

    // small wave: swing the wrist left-right in small increments while palm remains facing out

    // wave: move hand in opposite direction
    const wave: AnimationFrame = [
        ["mixamorig:RightForeArm", "rotation", "z", -Math.PI / 4, "-"],
    ];

    context.animations.push(wave);

    // return to neutral
    const reset: AnimationFrame = [
        // Reset fingers to neutral
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
        // Reset hand to neutral
        ["mixamorig:RightHand", "rotation", "z", 0, "-"],
        ["mixamorig:RightHand", "rotation", "y", 0, "-"],
        // Reset forearm to neutral
        ["mixamorig:RightForeArm", "rotation", "x", 0, "-"],
        ["mixamorig:RightForeArm", "rotation", "z", 0, "-"],
        // Reset arm to neutral
        ["mixamorig:RightArm", "rotation", "x", 0, "+"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3, "-"],
    ];

    // Hold the last pose briefly then reset and queue the default pose immediately
    const holdFrame: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 4, "+"],
    ];

    context.animations.push(holdFrame);
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
