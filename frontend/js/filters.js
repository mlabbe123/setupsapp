angular.module('setupListingFilters', [])
    .filter('listingFilter', function() {
        return function(items, filter_query) {

            var out = [];

            for(var key in filter_query) {
                if(filter_query.hasOwnProperty(key)) {
                    if(filter_query[key] === items[key]) {
                        out.push(item);
                    }
                }

            }

            // if(!car && !track && !author && !type) {

            //     // No filters applied so return every items.
            //     return items;
            // } else {
            //     console.log(items)
            //     var filteredResults = items;

            //     if(car !== undefined) {
            //         angular.forEach(filteredResults, function(item) {
            //             if(car !== item.car.name) {
            //                _.pull(filteredResults, item);
            //             }
            //         });
            //     }

            //     if(track !== undefined && filteredResults.length > 0) {
            //         angular.forEach(filteredResults, function(item) {
            //             if(item !== undefined && track !== item.track.name) {
            //                 _.pull(filteredResults, item);
            //             }
            //         });
            //     }

            //     if(author !== undefined && filteredResults.length > 0) {
            //         console.log(filteredResults)
            //         angular.forEach(filteredResults, function(item) {
            //             console.log(item)
            //             if(item.author.display_name.indexOf(author) === -1) {
            //                 _.pull(filteredResults, item);
            //             }
            //         });
            //     }

            //     if(type !== undefined && filteredResults.length > 0) {
            //         angular.forEach(filteredResults, function(item) {
            //             if(item !== undefined && type !== item.type) {
            //                _.pull(filteredResults, item);
            //             }
            //         });
            //     }
            //     //console.log(filteredResults)
            //     return filteredResults;
            // }
        };
    });