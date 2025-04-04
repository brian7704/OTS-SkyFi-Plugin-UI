import {ReactElement, useEffect, useState} from "react";
import axios from '../axios_config';
import {routes} from '@/routes'
import {Button, Card, Group, TableData, useComputedColorScheme, Text, Image, Grid} from "@mantine/core";
import packageJson from '../../package.json'

interface Response {
    request: {};
    total: number;
    orders: Order[];
}

interface Order {
    aoi: string;
    deliveryDriver: string;
    deliveryParams: string;
    label: string;
    orderLabel: string;
    metadata: {};
    webhookUrl: string;
    archiveId: string;
    id: string;
    orderType: string;
    orderCost: string;
    ownerId: string;
    status: string;
    aoiSqkm: number;
    tilesUrl: string;
    downloadImageUrl: string;
    downloadPayloadUrl: string;
    orderCode: string;
    geocodeLocation: string;
    createdAt: string;
    archive: Archive;
}

interface Archive {
    archiveId: string;
    provider: string;
    constellation: string;
    productType: string;
    platformResolution: number;
    resolution: string;
    captureTimestamp: string;
    cloudCoveragePercent: number;
    offNadirAngle: number;
    footprint: string;
    minSqKm: number;
    maxSqKm: number;
    priceForOneSquareKm: number;
    priceFullScene: number;
    openData: boolean;
    totalAreaSquareKm: number;
    deliveryTimeHours: number;
    thumbnailUrls: {[key: string]: string};
    gsd: number;
    tilesUrl: string;
}

export default function SkyFi() {
    const [activePage, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [generatingDataPackage, setGeneratingDataPackage] = useState(false);
    const [orderCards, setOrderCards] = useState<ReactElement[]>();

    useEffect(() => {
        getOrders()
    }, []);

    function getOrders() {
        axios.get<Response>(`${routes.orders}?page=${activePage}`).then((r) => {
            if (r.status === 200) {
                console.log(r);

                const orders: ReactElement[] = [];

                r.data.orders.map((order:Order) => {
                    let thumbnail_url = `${packageJson.basename}/ui/placeholder.jpg`;

                    if (Object.hasOwn(order, "archive")) {
                        Object.keys(order.archive.thumbnailUrls).map((key: string) => {
                            thumbnail_url = order.archive.thumbnailUrls[key];
                        })
                    }

                    const order_card = <Grid.Col span={{ base: 12, md: 6, lg: 4}}>
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Card.Section>
                                    <Image
                                        src={thumbnail_url}
                                        height={160}
                                    />
                                </Card.Section>

                                <Group justify="space-between" mt="md" mb="xs">
                                    <Text fw={500}>{order.geocodeLocation}</Text>
                                </Group>

                                <Text size="sm" c="dimmed">
                                    With Fjord Tours you can explore more of the magical fjord landscapes with tours and
                                    activities on and around the fjords of Norway
                                </Text>

                                <Button color="blue" fullWidth mt="md" radius="md">
                                    Book classic tour now
                                </Button>
                            </Card>
                        </Grid.Col>

                    orders.push(order_card);
                });

                setOrderCards(orders)

            }
        }).catch((err) => {
            console.log(err);
        })
    }

    return (
        <Grid pt="md">
            {orderCards}
        </Grid>
    )
};
