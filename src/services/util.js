import moment from 'moment'

export default {
    formatDate: function(value) {
        if (value) {
            return moment.unix(parseInt(value)).format('DD-MMM-YYYY HH:mm')
        }
    },
    prettyBytes: function(size) {
        size = parseInt(size);

        const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        let i = 0;
        while (size >= 1000 && i < units.length - 1) {
          size /= 1000;
          i++;
        }
        return `${size.toFixed(2)} ${units[i]}`;
    },
    download: function(data, fileName) {
        try {
            // Decode Base64 string
            const binaryString = atob(data);
    
            // Convert to Uint8Array
            const byteArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
            }
    
            // Create a Blob
            const blob = new Blob([byteArray], { type: "application/octet-stream" });
    
            // Trigger file download
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            return byteArray; // Return Uint8Array for further processing
        } catch (error) {
            console.error("Error decoding base64 file:", error.message);
            return null;
        }
    },
}