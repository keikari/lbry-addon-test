class FloatingPlayer {
	constructor() {
		this.video_element = document.querySelector("#floating_player");
		this.sd_hash = null;
		this.video_duration = 0;
		this.start_timestamp = 0;
		this.video_element.onloadeddata = () =>  {this.doOnLoadedData()};

		this.time_tracker_interval_id = null;
	}

	doOnLoadedData() {
		console.log("Floating player loaded");
		this.video_element.currentTime = this.start_timestamp;
		this.updateDuration();
		this.startSavingTimestamp();
	}

	close() {
		this.stopSavingTimestamp();
		this.video_element.pause();
		this.video_element.style.height = 0;
		this.video_element.hidden = true;
	}

	show() {
		this.updateSource();
		this.video_element.play();
		this.video_element.controls = true;
		this.video_element.style = "";
		this.video_element.hidden = false;
	}

	updateSource() {
		this.video_element.src = `${server}:${stream_port}/stream/${this.sd_hash}`;
	}

	updateDuration() {
		this.video_duration = this.video_element.duration;
	}

	startSavingTimestamp() {
		if (this.getDuration() > 300) {
			this.time_tracker_interval_id = setInterval(() => {
				let currentTime = this.getCurrentTime();
				if (currentTime <= (this.video_duration * 0.9))
					localStorage.setItem(this.sd_hash, currentTime);
				else
					localStorage.removeItem(this.sd_hash);
			}, 1000 * 1);
		}
	}

	stopSavingTimestamp() {
		clearInterval(this.time_tracker_interval_id);
	}

	hasSource() {
		return this.video_element.src != "";
	}

	getCurrentTime() {
		return this.video_element.currentTime;
	}

	getDuration() {
		return this.video_duration;
	}


	getSd_hash() {
		return this.sd_hash;
	}

	setStartTime(time) {
		this.start_timestamp = time;
	}
	setSd_hash(sd_hash) {
		console.log("Sd_hash set");
		this.sd_hash = sd_hash;
	}

};

