import type { AnimationContext, AnimationFrame } from "../types";
import { setDefaultPose } from "../defaultPose";

/**
 * ISL gesture animation for word 'HELP' (Official ISLRTC Lexicon)
 * Closed right fist resting on open flat left palm, both lifted together upward.
 */
export const createWordHelp = (context: AnimationContext): void => {
    // Bring both hands to chest center: Left hand flat palm up, Right hand fist on top
    const frame1: AnimationFrame = [
        // Left arm: open flat palm facing up at lower chest
        ["mixamorig:LeftArm", "rotation", "x", -Math.PI / 4, "-"],
        ["mixamorig:LeftArm", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorig:LeftForeArm", "rotation", "x", Math.PI / 3, "+"],
        ["mixamorig:LeftHand", "rotation", "x", -Math.PI / 4, "-"],
        ["mixamorig:LeftHand", "rotation", "z", -Math.PI / 6, "-"],

        // Left fingers open flat
        ["mixamorig:LeftHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandRing1", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandPinky1", "rotation", "z", 0, "+"],

        // Right arm: fist resting on top of left hand
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 3.5, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 2.8, "+"],
        
        // Right fist closed
        ["mixamorig:RightHandIndex1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandRing1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "y", Math.PI / 2, "+"],
    ];

    context.animations.push(frame1);

    // Frame 2: Upward lifting motion together
    const liftFrame: AnimationFrame = [
        ["mixamorig:LeftArm", "rotation", "x", -Math.PI / 2.8, "-"],
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 2.8, "-"],
    ];
    context.animations.push(liftFrame);

    // Return to neutral pose
    setDefaultPose(context);

    if (context.pending === false) {
        context.pending = true;
        if (typeof context.animate === "function") {
            context.animate();
        }
    }
};
