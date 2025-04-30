import {ReactElement, useEffect, useState} from "react";
import axios from '../axios_config';
import { parseISO, format } from 'date-fns';
import {routes} from '@/routes'
import { notifications } from '@mantine/notifications';
import {IconCheck, IconX} from "@tabler/icons-react";
import {
    Button,
    Card,
    Group,
    useComputedColorScheme,
    Text,
    Image,
    Grid,
    Pagination,
    Center, LoadingOverlay, Modal
} from "@mantine/core";
import packageJson from '../../package.json'

interface Response {
    request: Request;
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

interface Request {
    orderType: string;
    pageNumber: number;
    pageSize: number;
}

export default function SkyFi() {
    const [activePage, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [generatingDataPackage, setGeneratingDataPackage] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [orderCards, setOrderCards] = useState<ReactElement[]>();

    useEffect(() => {
        setShowLoadingOverlay(true);
        getOrders();
    }, [activePage]);

    useEffect(() => {
        setShowLoadingOverlay(false);
    }, [orderCards]);

    useEffect(() => {
        if (previewImageUrl) {
            setShowImagePreview(true);
        }
    }, [previewImageUrl]);

    function createDataPackage(id: string) {
        axios.get(`${packageJson.basename}/${id}/data_package`).then((r) => {
            if (r.status === 200) {
                notifications.show({
                    title: 'Success',
                    message: `Data package created`,
                    icon: <IconCheck />,
                    color: 'green',
                })
            }
        }).catch((err) => {
            console.log(err);
            notifications.show({
                title: 'Failed to create data package',
                message: err.response.data.error,
                icon: <IconX />,
                color: 'red',
            })
        });
    }

    function getOrders() {
        axios.get<Response>(routes.orders, {params: {"page": activePage - 1}}).then((r) => {
            if (r.status === 200) {
                const orders: ReactElement[] = [];

                setTotalPages(Math.ceil((r.data.total / r.data.request.pageSize)))

                r.data.orders.map((order:Order) => {
                    let thumbnail_url = `${packageJson.basename}/ui/placeholder.jpg`;

                    if (Object.hasOwn(order, "archive")) {
                        Object.keys(order.archive.thumbnailUrls).map((key: string) => {
                            thumbnail_url = order.archive.thumbnailUrls[key];
                        })
                    }

                    const order_card = <Grid.Col span={{ base: 12, md: 6, lg: 4}}>
                            <Card shadow="lg" padding="lg" radius="md" withBorder>
                                <Card.Section>
                                    <Image
                                        src={thumbnail_url}
                                        height={160}
                                        onClick={() => {setPreviewImageUrl(thumbnail_url)}}
                                    />
                                </Card.Section>

                                <Group justify="space-between" mt="md" mb="xs">
                                    <Text fw={700}>{`${order.geocodeLocation} - SkyFi-${order.orderCode}`}</Text>
                                </Group>

                                <Text size="md"><Text span inherit fw={700}>Order Status:</Text> {order.status}</Text>
                                <Text size="md"><Text span inherit fw={700}>Provider:</Text> {order.archive.provider}</Text>
                                <Text size="md"><Text span inherit fw={700}>Resolution:</Text> {order.archive.resolution}</Text>
                                <Text size="md"><Text span inherit fw={700}>Cloud Coverage:</Text> {`${Math.round(order.archive.cloudCoveragePercent * 100)/100}%`}</Text>
                                <Text size="md"><Text span inherit fw={700}>Total Area:</Text> {`${order.aoiSqkm} KM²`}</Text>
                                <Text size="md"><Text span inherit fw={700}>Capture Date:</Text> {format(parseISO(order.archive.captureTimestamp), "yyyy-MM-dd HH:mm:ss xx")}</Text>
                                <Text size="md"><Text span inherit fw={700}>Cost:</Text> {`$${order.orderCost}`}</Text>

                                <Button color="blue" fullWidth mt="md" radius="md" onClick={() => {
                                    createDataPackage(order.id);
                                }}>
                                    Create Data Package
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
        <>
            <LoadingOverlay visible={showLoadingOverlay} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Grid p="md" m="md">
                {orderCards}
            </Grid>
            <Modal opened={showImagePreview} onClose={() => setShowImagePreview(false)}>
                <Image src={previewImageUrl} radius="md" />
            </Modal>
            <Center pb="md"><Pagination total={totalPages} value={activePage} onChange={setPage} withEdges /></Center>
        </>
    )
};
