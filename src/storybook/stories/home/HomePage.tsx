import { adminUserPermissions } from "@saleor/fixtures";
import { PermissionEnum } from "@saleor/graphql";
import { storiesOf } from "@storybook/react";
import React from "react";

import HomePageComponent, {
  HomePageProps,
} from "../../../home/components/HomePage";
import Decorator from "../../Decorator";
import { MockedUserProvider } from "../customers/MockedUserProvider";

const homePageProps: Omit<HomePageProps, "classes"> = {
  activities: undefined,
  noChannel: false,
  createNewChannelHref: "",
  ordersToFulfillHref: "",
  ordersToCaptureHref: "",
  productsOutOfStockHref: "",
  orders: undefined,
  ordersToCapture: undefined,
  ordersToFulfill: undefined,
  productsOutOfStock: undefined,
  sales: undefined,
  topProducts: undefined,
  userName: "admin@example.com",
  period: undefined,
  setPeriod: undefined,
  fetchMore: undefined,
  pageInfo: undefined,
};

const HomePage = props => {
  const customPermissions = props?.customPermissions;

  return (
    <MockedUserProvider customPermissions={customPermissions}>
      <HomePageComponent {...props} />
    </MockedUserProvider>
  );
};

storiesOf("Views / HomePage", module)
  .addDecorator(Decorator)
  .add("default", () => <HomePage {...homePageProps} />)
  .add("loading", () => (
    <HomePage
      {...homePageProps}
      activities={undefined}
      orders={undefined}
      ordersToCapture={undefined}
      ordersToFulfill={undefined}
      productsOutOfStock={undefined}
      sales={undefined}
      topProducts={undefined}
      userName={undefined}
    />
  ))
  .add("no data", () => (
    <HomePage {...homePageProps} topProducts={[]} activities={[]} />
  ))
  .add("no permissions", () => (
    <HomePage {...homePageProps} customPermissions={[]} />
  ))
  .add("product permissions", () => (
    <HomePage
      {...homePageProps}
      customPermissions={adminUserPermissions.filter(
        perm => perm.code === PermissionEnum.MANAGE_PRODUCTS,
      )}
    />
  ))
  .add("order permissions", () => (
    <HomePage
      {...homePageProps}
      customPermissions={adminUserPermissions.filter(
        perm => perm.code === PermissionEnum.MANAGE_ORDERS,
      )}
    />
  ));
