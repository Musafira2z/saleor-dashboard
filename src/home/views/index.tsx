/* eslint-disable no-console */
import { useUser } from "@saleor/auth";
import { channelsListUrl } from "@saleor/channels/urls";
import useAppChannel from "@saleor/components/AppLayout/AppChannelContext";
import { hasPermissions } from "@saleor/components/RequirePermissions";
import {
  OrderStatusFilter,
  PermissionEnum,
  ReportingPeriod,
  StockAvailability,
  useHomeQuery,
} from "@saleor/graphql";
import { mapEdgesToItems } from "@saleor/utils/maps";
import React from "react";

import { getDatePeriod, getUserName } from "../../misc";
import { orderListUrl } from "../../orders/urls";
import { productListUrl } from "../../products/urls";
import HomePage from "../components/HomePage";

const HomeSection = () => {
  const { user } = useUser();
  const { channel } = useAppChannel();
  const noChannel = !channel && typeof channel !== "undefined";
  const userPermissions = user?.userPermissions || [];
  const [period, setPeriod] = React.useState(1);

  const variables = {
    channel: channel?.slug,
    datePeriod: getDatePeriod(1),
    PERMISSION_MANAGE_ORDERS: hasPermissions(userPermissions, [
      PermissionEnum.MANAGE_ORDERS,
    ]),
    PERMISSION_MANAGE_PRODUCTS: hasPermissions(userPermissions, [
      PermissionEnum.MANAGE_PRODUCTS,
    ]),
    reportingPeriod:
      period === 1 ? ReportingPeriod.TODAY : ReportingPeriod.THIS_MONTH,
    firstTopProducts: 10,
    lastActivities: 10,
    afterTopProducts: null,
    beforeTopProducts: null,
  };

  const { data, fetchMore } = useHomeQuery({
    displayLoader: true,
    skip: noChannel,
    variables,
  });

  return (
    <HomePage
      activities={mapEdgesToItems(data?.activities)?.reverse()}
      orders={data?.ordersToday?.totalCount}
      sales={data?.salesPeriod?.gross}
      topProducts={mapEdgesToItems(data?.topProducts)}
      pageInfo={data?.topProducts?.pageInfo}
      fetchMore={fetchMore}
      createNewChannelHref={channelsListUrl()}
      ordersToCaptureHref={orderListUrl({
        status: [OrderStatusFilter.READY_TO_CAPTURE],
        channel: [channel?.id],
      })}
      ordersToFulfillHref={orderListUrl({
        status: [OrderStatusFilter.READY_TO_FULFILL],
        channel: [channel?.id],
      })}
      productsOutOfStockHref={productListUrl({
        stockStatus: StockAvailability.OUT_OF_STOCK,
        channel: channel?.slug,
      })}
      ordersToCapture={data?.ordersToCapture?.totalCount}
      ordersToFulfill={data?.ordersToFulfill?.totalCount}
      productsOutOfStock={data?.productsOutOfStock.totalCount}
      userName={getUserName(user, true)}
      noChannel={noChannel}
      setPeriod={setPeriod}
      period={period}
    />
  );
};

export default HomeSection;
