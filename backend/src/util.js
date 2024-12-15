const sleep = (tempo) => {
    return new Promise( (resolve) => {
        setTimeout(() => { resolve(); }, tempo);
    });
};

export {
    sleep
};


