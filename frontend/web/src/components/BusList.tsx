import React, { useState } from "react";
import {
  Search,
  Filter,
  Star,
  Bus as BusIcon,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { BusCard } from "./BusCard";
import { ScrollArea } from "./ui/scroll-area";

interface Bus {
  id: string;
  licensePlate: string;
  route: string;
  status:
    | "moving"
    | "parked"
    | "maintenance"
    | "needs_urgent_maintenance"
    | "usable";
  position: { lat: number; lng: number };
  driver: string;
  parkedTime?: number;
  movingTime?: number;
  isFavorite: boolean;
}

interface BusListProps {
  buses: Bus[];
  selectedBus: string | null;
  onBusSelect: (busId: string) => void;
  onToggleFavorite: (busId: string) => void;
}

export function BusList({
  buses,
  selectedBus,
  onBusSelect,
  onToggleFavorite,
}: BusListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.licensePlate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      bus.route
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      bus.driver
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || bus.status === statusFilter;
    const matchesFavorites =
      !showFavoritesOnly || bus.isFavorite;

    return matchesSearch && matchesStatus && matchesFavorites;
  });

  const getStatusCounts = () => {
    return {
      total: buses.length,
      moving: buses.filter((b) => b.status === "moving").length,
      parked: buses.filter((b) => b.status === "parked").length,
      maintenance: buses.filter(
        (b) => b.status === "maintenance",
      ).length,
      favorites: buses.filter((b) => b.isFavorite).length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BusIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold">BusTrack</h2>
            <p className="text-sm text-muted-foreground">
              Flota de Buses
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, ruta o conductor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="moving">
                En Movimiento
              </SelectItem>
              <SelectItem value="parked">
                Estacionado
              </SelectItem>
              <SelectItem value="maintenance">
                Mantenimiento
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setShowFavoritesOnly(!showFavoritesOnly)
            }
            className="px-3"
          >
            <Star
              className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`}
            />
          </Button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Total:
            </span>
            <Badge variant="secondary">{counts.total}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Favoritos:
            </span>
            <Badge variant="secondary">
              {counts.favorites}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              En mov:
            </span>
            <Badge className="bg-green-100 text-green-800">
              {counts.moving}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Parados:
            </span>
            <Badge className="bg-yellow-100 text-yellow-800">
              {counts.parked}
            </Badge>
          </div>
        </div>
      </div>

      {/* Bus List */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3 pb-6">
          {filteredBuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BusIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron buses</p>
              <p className="text-sm">
                Intenta ajustar los filtros
              </p>
            </div>
          ) : (
            filteredBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                isSelected={selectedBus === bus.id}
                onSelect={() => onBusSelect(bus.id)}
                onToggleFavorite={() =>
                  onToggleFavorite(bus.id)
                }
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}