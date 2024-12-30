const FILE_INPUT_ID = "lib"
const SUBMIT_ID = 'submit_btn'

btn = document.getElementById(SUBMIT_ID)
btn.addEventListener("click", async () => {
    files = document.getElementById("lib").files
    if (files.length == 1) {
        file = new zip.ZipReader(new zip.BlobReader(files[0]))
        entries = await file.getEntries()
        kicad_files = entries.filter(entry => {
            filename = entry.filename
            return filename.includes("KiCad") && (filename.endsWith(".lib") || filename.endsWith(".kicad_mod"))
        })
        model = entries.filter(entry => entry.filename.endsWith(".stp"))[0]
        lib_files = kicad_files.concat(model)

        const zipFileWriter = new zip.BlobWriter();
        const zipWriter = new zip.ZipWriter(zipFileWriter);

        for (i = 0; i < lib_files.length; i++) {
            blobWriter = new zip.BlobWriter()
            filename = lib_files[i].filename.split("/").at(-1)
            console.log(filename)
            blob = await lib_files[i].getData(blobWriter)
            blobReader = new zip.BlobReader(blob)
            zipWriter.add(filename, blobReader)
        }

        blobURL = URL.createObjectURL(await zipWriter.close());
        if (blobURL) {
            const anchor = document.createElement("a");
            const clickEvent = new MouseEvent("click");
            anchor.href = blobURL;
            anchor.download = "library.zip";
            anchor.dispatchEvent(clickEvent);
        }
        downloadButton.disabled = true;
        event.preventDefault();
    } else {
        alert("No zip file selected")
    }

})
