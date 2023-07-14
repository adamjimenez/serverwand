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
}