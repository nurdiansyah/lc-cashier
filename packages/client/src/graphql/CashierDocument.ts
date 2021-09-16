import { gql, PageCursorInfoFragment } from "@deboxsoft/module-graphql";

const CashierFragment = gql`
  fragment CashierFragment on Cashier {
    id
    date
    programId
    student
    description
    debitAccount
    amount
    discount
  }
`;

const CashierPageResultFragment = gql`
  fragment CashierPageResultFragment on CashierPageResult {
    data {
      ...CashierFragment
    }
    pageInfo {
      ...PageCursorInfoFragment
    }
  }
  ${CashierFragment}
  ${PageCursorInfoFragment}
`;

export const CreateCashierMutation = gql`
  mutation create($input: CashierInput!) {
    createCashier(input: $input)
  }
`;

export const UpdateCashierMutation = gql`
  mutation update($id: ID!, $input: CashierUpdateInput!) {
    updateCashier(id: $id, input: $input)
  }
`;

export const RemoveCashierMutation = gql`
  mutation remove($id: ID!) {
    removeCashier(id: $id)
  }
`;

export const FindCashierQuery = gql`
  query find {
    findCashier {
      ...CashierFragment
    }
  }
  ${CashierFragment}
`;

export const FindCashierPageQuery = gql`
  query find {
    findCashierPage {
      ...CashierPageResultFragment
    }
  }
  ${CashierPageResultFragment}
`;

export const FindCashierByIdQuery = gql`
  query findById($id: ID!) {
    findCashierById(id: $id) {
      ...CashierFragment
    }
  }
  ${CashierFragment}
`;

export const CashierCreatedSubs = gql`
  subscription onCashierCreated {
    cashierCreated {
      ...CashierFragment
    }
  }
  ${CashierFragment}
`;

export const CashierUpdatedSubs = gql`
  subscription onCashierUpdated {
    cashierUpdated {
      ...CashierFragment
    }
  }
  ${CashierFragment}
`;

export const CashierRemovedSubs = gql`
  subscription onCashierRemoved {
    cashierRemoved
  }
`;
