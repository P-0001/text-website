const mods = {
    "prase-uptime": {
        vars: {
            uptime: "string"
        }
    }
}

const modStrings = Object.keys(mods);

function addModules() {
    const select = document.getElementById("module");
    modStrings.forEach(mod => {
        const option = document.createElement("option");
        option.value = mod;
        option.textContent = mod;
        select.appendChild(option);
    });
}

function updateOptiosn(mod = "") {
    if (!mod) return;

    if (!modStrings.includes(mod)) return;

    

    switch (mod) {
        case "clean":
            break;
        case "remove":
            break;
        default:
            break;
    }
}



document.addEventListener("DOMContentLoaded", function () {
    addModules();
    const select = document.getElementById("module");

    select.addEventListener("change", function () {
        const option = document.getElementById("option");
        updateOptiosn(option.value);
    });

});