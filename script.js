import { Jimp } from "jimp";
import GIFEncoder from "gif-encoder-2";
import fs from "fs";

const INPUT_IMAGE = "input.png";
const OUTPUT_GIF = "output.gif";
const GIF_DURATION = 60;
const FRAMES_PER_SECOND = 2;

async function createSlowLoadingGif() {
  try {
    // Load the input image
    const image = await Jimp.read(INPUT_IMAGE);
    const { width, height } = image.bitmap;

    // Create GIF encoder
    const encoder = new GIFEncoder(width, height);
    const stream = fs.createWriteStream(OUTPUT_GIF);
    encoder.createReadStream().pipe(stream);

    const totalFrames = GIF_DURATION * FRAMES_PER_SECOND;
    console.log("image totalFrames", totalFrames);
    const linesPerFrame = Math.ceil(height / totalFrames);

    encoder.start();
    encoder.setRepeat(0); // Infinite loop
    encoder.setDelay(1000 / FRAMES_PER_SECOND); // Delay per frame in ms
    encoder.setQuality(10);

    // Generate frames
    for (let frame = 0; frame < totalFrames; frame++) {
      console.log("frame", frame);
      const revealHeight = Math.min(height, linesPerFrame * frame);

      // Create a blank white image
      const frameImage = new Jimp({ width, height, color: 0xffffffff });

      // Composite the revealed part of the image onto the white background
      const cropImage = image
        .clone()
        .crop({ x: 0, y: 0, w: width, h: revealHeight });
      frameImage.composite(cropImage, 0, 0);

      // Add frame to GIF
      encoder.addFrame(frameImage.bitmap.data);

      // Break the loop when the image is fully revealed
      if (revealHeight >= height) {
        break;
      }
    }

    encoder.finish();
    console.log(`GIF saved to ${OUTPUT_GIF}`);
  } catch (error) {
    console.error("Error creating GIF:", error);
  }
}

createSlowLoadingGif();
