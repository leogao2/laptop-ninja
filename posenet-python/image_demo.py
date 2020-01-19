import tensorflow as tf
import cv2
import time
import argparse
import os

import posenet
import json
from PIL import Image
import cv2
from io import BytesIO
import numpy as np
import base64

def readb64(base64_string):
    assert base64_string.startswith('data:image/png;base64,')
    base64_string = base64_string[len('data:image/png;base64,'):]

    sbuf = BytesIO()
    sbuf.write(base64.b64decode(base64_string))
    pimg = Image.open(sbuf)
    return cv2.cvtColor(np.array(pimg), cv2.COLOR_RGB2BGR)


parser = argparse.ArgumentParser()
parser.add_argument('--model', type=int, default=101)
parser.add_argument('--scale_factor', type=float, default=1.0)
parser.add_argument('--notxt', action='store_true')
parser.add_argument('--image_dir', type=str, default='./images')
parser.add_argument('--output_dir', type=str, default='./output')
args = parser.parse_args()


sess = tf.Session()
model_cfg, model_outputs = posenet.load_model(args.model, sess)
output_stride = model_cfg['output_stride']


def compute(b64):
    input_image, draw_image, output_scale = posenet.utils._process_input(
        readb64(b64), scale_factor=args.scale_factor, output_stride=output_stride)

    heatmaps_result, offsets_result, displacement_fwd_result, displacement_bwd_result = sess.run(
        model_outputs,
        feed_dict={'image:0': input_image}
    )

    pose_scores, keypoint_scores, keypoint_coords = posenet.decode_multiple_poses(
        heatmaps_result.squeeze(axis=0),
        offsets_result.squeeze(axis=0),
        displacement_fwd_result.squeeze(axis=0),
        displacement_bwd_result.squeeze(axis=0),
        output_stride=output_stride,
        max_pose_detections=1,
        min_pose_score=0.25)

    keypoint_coords *= output_scale

    rets = {}
    if not args.notxt:
        print()
        print("Results for image")
        for pi in range(len(pose_scores)):
            if pose_scores[pi] == 0.:
                break
            print('Pose #%d, score = %f' % (pi, pose_scores[pi]))
            for ki, (s, c) in enumerate(zip(keypoint_scores[pi, :], keypoint_coords[pi, :, :])):
                print('Keypoint %s, score = %f, coord = %s' % (posenet.PART_NAMES[ki], s, c))
                rets[posenet.PART_NAMES[ki]] = {'score': s, 'coords': c.tolist()}
    return json.dumps(rets)

#print('Average FPS:', len(filenames) / (time.time() - start))

#compute(open("test.txt").read())