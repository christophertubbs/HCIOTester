class Application {
    audioContext = null;

    constructor() {
        this.audioContext = new AudioContext();
        this.assignEventHandlers();
    }

    /**
     *
     * @returns {HTMLParagraphElement}
     */
    get keyDisplay() {
        return document.getElementById("key-display")
    }

    /**
     *
     * @returns {HTMLButtonElement}
     */
    get recordButton() {
        return document.getElementById("record-button")
    }

    /**
     *
     * @returns {HTMLButtonElement}
     */
    get stopRecordingButton() {
        return document.getElementById("stop-recording-button")
    }

    /**
     *
     * @returns {HTMLAudioElement}
     */
    get audioElement() {
        return document.getElementById("audio-test")
    }

    /**
     *
     * @returns {HTMLSelectElement}
     */
    get soundWaveSelect() {
        return document.getElementById("sound-wave-select")
    }

    /**
     *
     * @returns {HTMLInputElement}
     */
    get oscilatorPitchRange() {
        return document.getElementById("oscilator-pitch")
    }

    /**
     *
     * @returns {HTMLButtonElement}
     */
    get oscilatorPlayButton() {
        return document.getElementById("oscilator-button")
    }

    /**
     *
     * @returns {HTMLSpanElement}
     */
    get pitchLabel() {
        return document.getElementById("selected-oscilator-pitch")
    }

    setupRecordButton = () => {
        let self = this;
        /**
         * What to do when the 'Record' button is clicked
         * @param event {MouseEvent}
         */
        this.recordButton.onclick = function (event) {
            // Get permission to use user media then use the provided audio stream
            navigator.mediaDevices.getUserMedia({audio: true}).then(
                //
                (mediaStream) => {
                    let mediaRecorder = new MediaRecorder(mediaStream);
                    let chunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        chunks.push(event.data);
                    }

                    self.stopRecordingButton.onclick = () => {
                        mediaRecorder.stop();
                        console.log(mediaRecorder.state);
                        console.log("recorder stopped");

                        self.stopRecordingButton.onclick = null;
                        self.stopRecordingButton.style.display = "None";
                        self.recordButton.style.display = "block";
                    }

                    mediaRecorder.onstop = (event) => {
                        console.log("recorder stopped");

                        const blob = new Blob(chunks, {type: "audio/ogg; codecs=opus"})
                        chunks = [];
                        self.audioElement.src = window.URL.createObjectURL(blob);
                        self.audioElement.style.display = "block";
                    }

                    mediaRecorder.start()
                    console.log(mediaRecorder.state)
                    console.log("recorder started")
                    self.recordButton.style.display = "none";
                    self.stopRecordingButton.style.display = "block";

                }
            ).catch(
                (error) => {
                    let message = `The following getUserMedia error occurred: ${error}`;
                    console.error(message);
                    alert(message);
                }
            )
        }
    }

    setupSoundTest = () => {
        let self = this;
        let oscillator = null;

        this.oscilatorPlayButton.onmousedown = function() {
            oscillator = self.audioContext.createOscillator();
            oscillator.type = self.soundWaveSelect.value;
            oscillator.frequency.value = Number.parseFloat(self.oscilatorPitchRange.value);
            oscillator.connect(self.audioContext.destination); //sends to output
            oscillator.start(self.audioContext.currentTime) //starts the sound at the current time
        }

        this.oscilatorPlayButton.onmouseup = function() {
            if (oscillator !== null) {
                oscillator.stop() //disconnects the oscillator
            }
        }

        this.oscilatorPitchRange.onchange = function(event) {
            let selectedPitch = event.target.value;
            self.pitchLabel.textContent = `${selectedPitch}hz`
        }
    }

    assignEventHandlers = () => {
        let self = this;

        // The key display should reflect the character typed whenever it is struck on the screen
        document.onkeydown = function(event) {
            self.keyDisplay.textContent = `You pressed: ${event.key}`;
        }

        this.setupSoundTest();

        // If the client has the ability to play with user media, assign the onclick, otherwise alert the user
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.setupRecordButton();
        } else {
            let message = "getUserMedia is not supported by your browser";
            console.error(message)
            alert(message)
            this.recordButton.style.display = "none";
            this.stopRecordingButton.style.display = "none";
        }
    }
}
window.addEventListener(
    "load",
    (event) => {
        document.application = new Application();
    }
);