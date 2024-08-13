export function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
        return "No Birthday";
    }
    else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}