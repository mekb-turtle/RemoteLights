const buttons = document.getElementsByClassName("button");

const sendRequest = async (cmd) => {
	try {
		const response = await fetch(`/send?command=${cmd}`, {
			method: "POST"
		});
	} catch (error) {
		console.error(`Error sending request with command: ${cmd}`, error);
		alert(`Error sending request: ${error}`);
	}
};

for (let i = 0; i < buttons.length; i++) {
	buttons[i].onclick = function() {
		const id = buttons[i].id.split("-");
		if (id[0] != "button") return;
		const cmd = parseInt(id[1], 16);
		sendRequest(cmd);
	};
}
