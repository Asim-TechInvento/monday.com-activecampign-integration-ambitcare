const utility = {
    getMondayFieldFromArr: (arr, searchField) => {
        return arr.find(item => item.title && item.title.toLowerCase().trim() == searchField.toLowerCase().trim());
    }
}

module.exports = utility