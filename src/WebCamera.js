export default class WebCamera extends HTMLElement {
  CANVAS_ELEMENT = this.querySelector('canvas');
  CONSTRAINTS = {
    video: {
      width: {
        min: 1280,
        ideal: 1920,
        max: 2560,
      },
      height: {
        min: 720,
        ideal: 1080,
        max: 1440,
      },
      facingMode: 'environment',
    },
  };
  DEVICES = [];
  IMG_ELEMENT = this.querySelector('img');
  TAKE_PHOTO_BUTTON = this.querySelector('button[type="button"]');
  STREAM_STARTED = false;
  VIDEO_ELEMENT = this.querySelector('video');

  async getCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.DEVICES = devices.filter((device) => device.kind === 'videoinput');

    return;
  }

  async startStream() {
    const stream = await navigator.mediaDevices.getUserMedia(this.CONSTRAINTS);

    if (this.VIDEO_ELEMENT) {
      this.VIDEO_ELEMENT.srcObject = stream;
      this.STREAM_STARTED = true;
    }
  }

  handlePlay() {
    if (this.STREAM_STARTED && this.VIDEO_ELEMENT) {
      this.VIDEO_ELEMENT.play();
    }

    if (navigator.mediaDevices) {
      this.startStream();
    }
  }

  dataToBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  };

  async handleImageCapture() {
    if (this.CANVAS_ELEMENT) {
      if (this.VIDEO_ELEMENT) {
        this.CANVAS_ELEMENT.height = this.VIDEO_ELEMENT.videoHeight;
        this.CANVAS_ELEMENT.width = this.VIDEO_ELEMENT.videoWidth;

        const context = this.CANVAS_ELEMENT.getContext('2d');

        if (context && this.VIDEO_ELEMENT) {
          context.drawImage(this.VIDEO_ELEMENT, 0, 0);
          const photoDataURL = this.CANVAS_ELEMENT.toDataURL('image/webp');
          const imageFile = new File([this.dataToBlob(photoDataURL)], 'image.webp', {
            type: 'image/webp',
          });

          if (this.IMG_ELEMENT) {
            this.IMG_ELEMENT.hidden = false;
            this.IMG_ELEMENT.src = photoDataURL;
          }

          const captureImageEvent = new CustomEvent('captureImage', {
            detail: {
              imageFile,
              photoDataURL,
            },
          });

          this.dispatchEvent(captureImageEvent);
        }
      }
    }
  }

  connectedCallback() {
    this.getCamera();
    this.handlePlay();

    if (this.TAKE_PHOTO_BUTTON) {
      this.TAKE_PHOTO_BUTTON.addEventListener('click', () => this.handleImageCapture());
    }
  }
}

customElements.define('web-camera', WebCamera);
