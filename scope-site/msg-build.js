'use strict';


/**
 * @type {{isPatternValid: (function(!string): boolean), getMsgBuilder: getMsgBuilder, hasInserts: (function(!string): boolean)}}
 */
const msgInserter = (() => {
    /**
     * названия стран (249 штук) + "America" if no country
     * @type {!string[]}
     */
    const countriesNames = ['America', 'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bonaire, Sint Eustatius and Saba', 'Bosnia and Herzegovina', 'Botswana', 'Bouvet Island', 'Brazil', 'British Indian Ocean Territory', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos Islands', 'Colombia', 'Comoros', 'Congo', 'Congo', 'Cook Islands', 'Costa Rica', 'Côte d\'Ivoire', 'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard Island and McDonald Islands', 'Holy See', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea', 'Korea', 'Kuwait', 'Kyrgyzstan', 'Lao People\'s Democratic Republic', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine, State of', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Réunion', 'Romania', 'Russian Federation', 'Rwanda', 'Saint Barthélemy', 'Saint Helena, Ascension and Tristan da Cunha', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Martin', 'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Svalbard and Jan Mayen', 'Swaziland', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Taiwan, Province of China[a]', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom of Great Britain and Northern Ireland', 'United States of America', 'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Viet Nam', 'Virgin Islands', 'Virgin Islands', 'Wallis and Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'];


    const insertionFuncs = new Map();
    insertionFuncs.set('name', ({nm}) => nm || 'man');
    insertionFuncs.set('NAME', ({nm}) => (nm || 'MAN').toUpperCase());
    insertionFuncs.set('age', ({age}) => age || 'ok');
    insertionFuncs.set('country', ({cid}) => countriesNames[cid] || 'America');


    /**
     * @param {!string} str
     * @returns {!function({object}): string}
     */
    const giveStr = (str) => {
        return () => str;
    };

    /**
     * @param {!string} msgPattern
     * @returns {!boolean}
     */
    const isPatternValid = (msgPattern) => {
        msgPattern = msgPattern
            .split('%name%').join('')
            .split('%NAME%').join('')
            .split('%age%').join('')
            .split('%country%').join('');
        return !hasInserts(msgPattern);
    };

    /**
     * @param {!string} msgPattern
     * @returns {!boolean}
     */
    const hasInserts = (msgPattern) => (-1 !== msgPattern.indexOf('%'));

    /**
     *
     * @param {!string} pattern
     * @returns {!(function({object}): string)}
     */
    const getMsgBuilder = (pattern) => {
        if (!isPatternValid(pattern)) {
            throw 'invalid: ' + pattern;
        }

        if (!hasInserts(pattern)) {
            return giveStr(pattern);
        }

        /**
         * @param {!string} pattern
         * @returns {Generator<{isInsertion: boolean, text: string}, void, *>}
         */
        function* parseMsgPattern(pattern) {
            const parts = pattern.split('%');
            for (let i = 0, l = parts.length; i < l; i++) {
                if (parts[i] !== '') {
                    yield {
                        isInsertion: (i % 2 === 1),
                        text: parts[i],
                    };
                }
            }
        }

        return msgPartJoiner([...parseMsgPattern(pattern)].map((part) => {
            return part.isInsertion ? insertionFuncs.get(part.text) : giveStr(part.text);
        }));
    };

    /**
     * @param {(function({object}): string)[]} funcs
     * @returns {!function({object}): string}
     */
    const msgPartJoiner = (funcs) => (man) => funcs.map(func => func(man)).join('');

    return {
        hasInserts,
        isPatternValid,
        getMsgBuilder,
    };
})();
