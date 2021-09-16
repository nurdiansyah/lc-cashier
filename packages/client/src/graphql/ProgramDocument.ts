import { gql, PageCursorInfoFragment } from "@deboxsoft/module-graphql";

const ProgramFragment = gql`
  fragment ProgramFragment on Program {
    id
    name
    period
  }
`;

const ProgramPageResultFragment = gql`
  fragment ProgramPageResultFragment on ProgramPageResult {
    data {
      ...ProgramFragment
    }
    pageInfo {
      ...PageCursorInfoFragment
    }
  }
  ${ProgramFragment}
  ${PageCursorInfoFragment}
`;

export const CreateProgramMutation = gql`
  mutation create($input: ProgramInput!) {
    createProgram(input: $input)
  }
`;

export const UpdateProgramMutation = gql`
  mutation update($id: ID!, $input: ProgramInput!) {
    updateProgram(id: $id, input: $input)
  }
`;

export const RemoveProgramMutation = gql`
  mutation remove($id: ID!) {
    removeProgram(id: $id)
  }
`;

export const FindProgramQuery = gql`
  query find {
    findProgram {
      ...ProgramFragment
    }
  }
  ${ProgramFragment}
`;

export const FindProgramPageQuery = gql`
  query findPage {
    findProgramPage {
      ...ProgramPageResultFragment
    }
  }
  ${ProgramPageResultFragment}
`;

export const FindProgramByIdQuery = gql`
  query findById($id: ID!) {
    findProgramById(id: $id) {
      ...ProgramFragment
    }
  }
  ${ProgramFragment}
`;

export const ProgramCreatedSubs = gql`
  subscription onProgramCreated {
    programCreated {
      ...ProgramFragment
    }
  }
  ${ProgramFragment}
`;

export const ProgramUpdatedSubs = gql`
  subscription onProgramUpdated {
    programUpdated {
      ...ProgramFragment
    }
  }
  ${ProgramFragment}
`;

export const ProgramRemovedSubs = gql`
  subscription onProgramRemoved {
    programRemoved
  }
`;
