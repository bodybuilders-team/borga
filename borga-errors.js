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
				message,
				info
			};
		};
	}

	addError(1000, 'FAIL', 'An error occurred');
	addError(1001, 'BAD_REQUEST', 'The request is bad');
	addError(1002, 'NOT_FOUND', 'The item does not exist');
	addError(1003, 'ALREADY_EXISTS', 'The item already exists');
	addError(1004, 'EXT_SVC_FAIL', 'External service failure');
	addError(1005, 'UNAUTHENTICATED', 'Invalid or missing token');
	addError(1006, 'MISSING_PARAM', 'Missing parameter');

	return errors;
}

const errorList = buildErrorList();

module.exports = errorList;
