import { Tag, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "@/api/category";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutletContext } from "react-router-dom";
import { CreateCategoryDialog } from "@/components/CreateCategoryDialog";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditCategoryDialog } from "@/components/EditCategoryDialog";
import { StaggerGroup, StaggerItem } from "@/components/animation/Stagger";
import FadeAnimation from "@/components/animation/FadeAnimation";
import { useAuth } from "@/auth/AuthContext";

export default function Category() {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Categories without an owner are shared: only staff may change them.
    const canEdit = (category) => category.owner != null || Boolean(user?.is_staff);

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [idToDelete, setIdToDelete] = useState(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);

    const { isModalOpen, setIsModalOpen } = useOutletContext();

    const handleCreated = (newCat) => {
        setCategories((prev) => [...prev, newCat]);
    };

    const handleUpdated = (updatedCat) => {
        setCategories((prev) => 
            prev.map((cat) => (cat.id === updatedCat.id ? updatedCat : cat))
        );
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        try {
            await deleteCategory(idToDelete);
            setCategories((prev) => prev.filter((cat) => cat.id !== idToDelete));
            toast.success(t('category.delete.actions.success'));
        } catch {
            toast.error(t('category.delete.actions.error'));
        } finally {
            setIsAlertOpen(false);
            setIdToDelete(null);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch {
                toast.error(t('core.fetch_error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [t]);

    return isLoading ? (<></>) : (
        <div className="h-full p-3 sm:p-6 space-y-6">
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('category.delete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('category.delete.desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('core.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('core.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <CreateCategoryDialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onCreated={handleCreated}
            />
            <EditCategoryDialog
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
                category={categoryToEdit} 
                onUpdated={handleUpdated} 
            />
            {categories.length === 0 ? (
                <FadeAnimation delay={.3} className="h-full flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-xl">
                    <div className="p-4 rounded-full bg-chart-4/15 text-chart-4 mb-4">
                        <Tag className="h-8 w-8" />
                    </div>
                    <p className="text-muted-foreground">{t('category.empty')}</p>
                    <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                        <Plus /> {t('category.first')}
                    </Button>
                </FadeAnimation>
            ) : (
                <StaggerGroup className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                    {categories.map((category) => (
                        <StaggerItem key={category.id} lift>
                            <Card className="overflow-hidden transition-shadow hover:shadow-md py-2">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 px-5">
                                    <div className="flex items-center gap-3">
                                        <span
                                            aria-hidden="true"
                                            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: `${category.color}26`, color: category.color }}
                                        >
                                            <Tag className="size-4" />
                                        </span>
                                        <CardTitle className="text-sm font-semibold">
                                            {category.label}
                                        </CardTitle>
                                        {category.owner == null && (
                                            <Badge variant="secondary" className="text-[10px]">{t('category.shared')}</Badge>
                                        )}
                                    </div>
                                    {canEdit(category) && <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => {
                                                setCategoryToEdit(category);
                                                setIsEditOpen(true);
                                            }}>
                                                <Edit2 className="mr-2 h-4 w-4" /> {t('category.actions.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onSelect={() => {
                                                    setIdToDelete(category.id);
                                                    setIsAlertOpen(true);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" /> {t('category.actions.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>}
                                </CardHeader>
                            </Card>
                        </StaggerItem>
                    ))}
                </StaggerGroup>
            )}
        </div>
    );
}
