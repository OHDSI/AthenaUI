import reduxifyServices from 'feathers-reduxify-services';
import API from 'services/Api';

interface ISearchTermsServices {
	terms: any,
	facets: any,
	relations: any,
	relationships: any,
}

export default <ISearchTermsServices> reduxifyServices(
	API,
	{
		'concepts': 'terms',
		'concepts/facets': 'facets',
		'concepts/:id/relations': 'relations',
		'concepts/:id/relationships': 'relationships',
	}
);