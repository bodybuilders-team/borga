'use strict';


/**
 * Builds an errors list.
 * @returns errors list
 */
function buildErrorList() {
	const errors = {};

	/**
	 * Adds an error to the error list.
	 * @param {Number} code 
	 * @param {String} name 
	 * @param {String} message 
	 */
	function addError(code, name, message) {
		errors[name] = info => {
			return {
				code,
				name,
				message: message + " " + JSON.stringify(info),
				info
			};
		};
	}

	addError(1000, 'FAIL', 'An error occurred');
	addError(1001, 'BAD_REQUEST', 'The request is bad.');
	addError(1001, 'NOT_FOUND', 'The item does not exist');
	addError(1002, 'ALREADY_EXISTS', 'The item already exists');
	addError(1003, 'INVALID_VALUE', 'The value is invalid');
	addError(1004, 'EXT_SVC_FAIL', 'External service failure');

	return errors;
}

const errorList = buildErrorList();

module.exports = errorList;
