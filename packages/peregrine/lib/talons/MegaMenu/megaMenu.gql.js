import { gql } from '@apollo/client';

export const GET_MEGA_MENU = gql`
    query getMegaMenu {
        categoryList {
            id
            name
            children {
                id
                include_in_menu
                name
                image_app_url
                position
                url_path
                url_suffix
                url_key
                children {
                    id
                    include_in_menu
                    name
                    position
                    url_path
                    url_suffix
                    url_key
                    children {
                        id
                        include_in_menu
                        name
                        position
                        url_path
                        url_suffix
                        url_key
                        children {
                            id
                            include_in_menu
                            name
                            position
                            url_path
                            url_suffix
                            url_key
                            children {
                                id
                                include_in_menu
                                name
                                position
                                url_path
                                url_suffix
                                url_key
                                children {
                                    id
                                    include_in_menu
                                    name
                                    position
                                    url_path
                                    url_suffix
                                    url_key
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

export default {
    getMegaMenuQuery: GET_MEGA_MENU
};
