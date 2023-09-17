import { gql } from "@apollo/client";

export const home = gql`
  query Home(
    $channel: String!
    $datePeriod: DateRangeInput!
    $reportingPeriod: ReportingPeriod!
    $PERMISSION_MANAGE_PRODUCTS: Boolean!
    $PERMISSION_MANAGE_ORDERS: Boolean!
    $firstTopProducts: Int
    $lastTopProducts: Int
    $beforeTopProducts: String
    $afterTopProducts: String
    $firstActivities: Int
    $lastActivities: Int
    $beforeActivities: String
    $afterActivities: String
  ) {
    salesPeriod: ordersTotal(period: $reportingPeriod, channel: $channel)
      @include(if: $PERMISSION_MANAGE_ORDERS) {
      gross {
        amount
        currency
      }
    }
    ordersToday: orders(filter: { created: $datePeriod }, channel: $channel)
      @include(if: $PERMISSION_MANAGE_ORDERS) {
      totalCount
    }
    ordersToFulfill: orders(
      filter: { status: READY_TO_FULFILL }
      channel: $channel
    ) @include(if: $PERMISSION_MANAGE_ORDERS) {
      totalCount
    }
    ordersToCapture: orders(
      filter: { status: READY_TO_CAPTURE }
      channel: $channel
    ) @include(if: $PERMISSION_MANAGE_ORDERS) {
      totalCount
    }
    ordersToUnconfirmed: orders(
      filter: { status: UNCONFIRMED }
      channel: $channel
    ) @include(if: $PERMISSION_MANAGE_ORDERS) {
      totalCount
    }
    ordersToUnfulfilled: orders(
      filter: { status: UNFULFILLED }
      channel: $channel
    ) @include(if: $PERMISSION_MANAGE_ORDERS) {
      totalCount
    }
    productsOutOfStock: products(
      filter: { stockAvailability: OUT_OF_STOCK }
      channel: $channel
    ) {
      totalCount
    }
    topProducts: reportProductSales(
      period: $reportingPeriod
      first: $firstTopProducts
      last: $lastTopProducts
      before: $beforeTopProducts
      after: $afterTopProducts
      channel: $channel
    ) @include(if: $PERMISSION_MANAGE_PRODUCTS) {
      edges {
        node {
          id
          revenue(period: $reportingPeriod) {
            gross {
              amount
              currency
            }
          }
          attributes {
            values {
              id
              name
            }
          }
          product {
            id
            name
            thumbnail {
              url
            }
          }
          quantityAvailable
          stocks {
            quantity
            productVariant {
              name
            }
          }
          quantityOrdered
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        __typename
      }
    }
    activities: homepageEvents(
      first: $firstActivities
      last: $lastActivities
      before: $beforeActivities
      after: $afterActivities
    ) @include(if: $PERMISSION_MANAGE_ORDERS) {
      edges {
        node {
          amount
          composedId
          date
          email
          emailType
          id
          message
          orderNumber
          oversoldItems
          quantity
          type
          user {
            id
            email
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        __typename
      }
    }
  }
`;
