export interface UserNameAutocompleteRequest {
  name_part: string;
}

export interface UserNameAutocompleteResponse {
  possible_names: string[];
}
