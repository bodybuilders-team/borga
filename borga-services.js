'use strict';


module.exports = function (data_ext, data_int) {
        return {
                searchGameByName: data_ext.getGameByName,

                getGroup: data_int.getGroupFromUser,
                createGroup: data_int.createGroup,
                editGroup: data_int.editGroup,
                listUserGroups: data_int.listUserGroups,
                deleteGroup: data_int.deleteGroup,
                getGroupDetails: data_int.getGroupDetails,
                removeGameFromGroup: data_int.removeGameFromGroup,
                getPopularGames: data_int.getPopularGames,

                createNewUser: data_int.createNewUser,
        };
}
